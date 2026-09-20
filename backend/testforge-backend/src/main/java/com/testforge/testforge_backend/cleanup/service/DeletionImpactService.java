package com.testforge.testforge_backend.cleanup.service;

import com.testforge.testforge_backend.cleanup.dto.DeletionImpactResponse;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DeletionImpactService {
    private final EntityManager em;
    private final TestCaseDeletionPolicy casePolicy;

    public DeletionImpactService(EntityManager em, TestCaseDeletionPolicy casePolicy) { this.em = em; this.casePolicy = casePolicy; }

    public DeletionImpactResponse project(Long id) {
        Scope s = scope("m.project_id=:id", id);
        Map<String,Long> extra = new LinkedHashMap<>();
        extra.put("Test Plans", count("select count(*) from test_plan where project_id=:id",id));
        extra.put("Modules", count("select count(*) from module where project_id=:id",id));
        extra.put("Test Suites", count("select count(*) from test_suite where project_id=:id",id));
        extra.put("Suite memberships", count("select count(*) from test_suite_scenario x join test_suite suite on suite.id=x.test_suite_id where suite.project_id=:id",id));
        List<String> blockers=count("select count(*) from test_suite_run where project_id=:id and status in ('PENDING','RUNNING')",id)>0?List.of("A Suite Run for this Project is currently active. Wait for it to finish."):List.of();
        return build("PROJECT",id,text("select project_id from project where id=:id",id),s,extra,
                count("select count(*) from test_suite_run where project_id=:id",id),blockers);
    }

    public DeletionImpactResponse testPlan(Long id) {
        Scope s=scope("m.test_plan_id=:id",id); Map<String,Long> extra=new LinkedHashMap<>();
        extra.put("Modules",count("select count(*) from module where test_plan_id=:id",id));
        return build("TEST_PLAN",id,text("select test_plan_id from test_plan where id=:id",id),s,extra,0,suiteBlockers("m.test_plan_id=:id",id));
    }
    public DeletionImpactResponse module(Long id){return build("MODULE",id,text("select module_id from module where id=:id",id),scope("m.id=:id",id),Map.of(),0,blockers("m.id=:id",id));}
    public DeletionImpactResponse requirement(Long id){return build("REQUIREMENT",id,text("select requirement_id from requirement where id=:id",id),scope("r.id=:id",id),Map.of(),0,blockers("r.id=:id",id));}
    public DeletionImpactResponse scenario(Long id){return build("SCENARIO",id,text("select scenario_id from test_scenario where id=:id",id),scope("ts.id=:id",id),Map.of(),0,blockers("ts.id=:id",id));}
    public DeletionImpactResponse testCase(Long id){Scope s=scope("tc.id=:id",id);return build("TEST_CASE",id,text("select test_case_id from test_case where id=:id",id),s,Map.of(),0,casePolicy.blockers(id));}
    public DeletionImpactResponse testStep(Long id){
        Map<String,Long> owned=new LinkedHashMap<>();owned.put("Test Steps",1L);owned.put("Automation Actions",count("select count(*) from automation_step where test_step_id=:id",id));
        Map<String,Long> history=Map.of("Historical results",count("select count(*) from suite_test_step_result where source_test_step_id=:id",id));
        List<String> blockers=count("select count(*) from automation_execution e join test_step s on s.test_case_id=e.test_case_id where s.id=:id and e.status in ('PENDING','RUNNING')",id)>0?List.of("An automation execution using this Test Step is still running. Wait for it to finish."):List.of();
        return new DeletionImpactResponse("TEST_STEP",id,text("select test_step_id from test_step where id=:id",id),owned,history,blockers,blockers.isEmpty());
    }
    public DeletionImpactResponse testSuite(Long id){
        Map<String,Long> owned=new LinkedHashMap<>();owned.put("Test Suites",1L);owned.put("Scenario memberships",count("select count(*) from test_suite_scenario where test_suite_id=:id",id));
        Map<String,Long> history=Map.of("Historical Suite Runs",count("select count(*) from test_suite_run where test_suite_id_snapshot=:id",id));
        List<String> blockers=count("select count(*) from test_suite_run where test_suite_id_snapshot=:id and status in ('PENDING','RUNNING')",id)>0?List.of("A Suite Run is currently active. Wait for it to finish."):List.of();
        return new DeletionImpactResponse("TEST_SUITE",id,text("select name from test_suite where id=:id",id),owned,history,blockers,blockers.isEmpty());
    }

    private DeletionImpactResponse build(String type,Long id,String business,Scope s,Map<String,Long> extra,long suiteRuns,List<String> blockers){
        Map<String,Long> owned=new LinkedHashMap<>(extra);put(owned,"Requirements",s.requirements);put(owned,"Scenarios",s.scenarios);put(owned,"Test Cases",s.cases);put(owned,"Test Steps",s.steps);put(owned,"Automation Scripts",s.scripts);put(owned,"Automation Actions",s.actions);
        Map<String,Long> history=new LinkedHashMap<>();put(history,"Historical executions",s.executions);put(history,"Historical Suite Runs",suiteRuns);
        return new DeletionImpactResponse(type,id,business,owned,history,List.copyOf(blockers),blockers.isEmpty());
    }
    private Scope scope(String condition,Long id){
        String cases="select tc.id from test_case tc join test_scenario ts on ts.id=tc.scenario_id join requirement r on r.id=ts.requirement_id join module m on m.id=r.module_id where "+condition;
        long requirements=condition.startsWith("m.")?count("select count(*) from requirement r join module m on m.id=r.module_id where "+condition,id):condition.startsWith("r.")?1:0;
        long scenarios=condition.startsWith("tc.")?0:condition.startsWith("ts.")?1:count("select count(*) from test_scenario ts join requirement r on r.id=ts.requirement_id join module m on m.id=r.module_id where "+condition,id);
        return new Scope(requirements, scenarios,
                count("select count(*) from ("+cases+") c",id),count("select count(*) from test_step where test_case_id in ("+cases+")",id),
                count("select count(*) from automation_script where test_case_id in ("+cases+")",id),count("select count(*) from automation_step where automation_script_id in (select id from automation_script where test_case_id in ("+cases+"))",id),
                count("select count(*) from automation_execution where test_case_id in ("+cases+") and status not in ('PENDING','RUNNING')",id));
    }
    private List<String> blockers(String condition,Long id){return new ArrayList<>(suiteBlockers(condition,id));}
    @SuppressWarnings("unchecked") private List<String> suiteBlockers(String condition,Long id){List<String> out=new ArrayList<>();List<String> names=(List<String>)em.createNativeQuery("select distinct suite.name from test_suite suite join test_suite_scenario x on x.test_suite_id=suite.id join test_scenario ts on ts.id=x.scenario_id join requirement r on r.id=ts.requirement_id join module m on m.id=r.module_id where "+condition).setParameter("id",id).getResultList();names.forEach(n->out.add("Used by active Test Suite: "+n));return out;}
    private long count(String sql,Long id){return ((Number)em.createNativeQuery(sql).setParameter("id",id).getSingleResult()).longValue();}
    private String text(String sql,Long id){List<?> rows=em.createNativeQuery(sql).setParameter("id",id).getResultList();if(rows.isEmpty())throw new IllegalArgumentException("Resource not found: "+id);return String.valueOf(rows.get(0));}
    private void put(Map<String,Long> map,String key,long value){if(value>0)map.put(key,value);} private record Scope(long requirements,long scenarios,long cases,long steps,long scripts,long actions,long executions){}
}
