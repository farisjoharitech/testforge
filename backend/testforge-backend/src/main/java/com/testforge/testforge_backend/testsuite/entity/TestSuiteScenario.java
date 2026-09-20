package com.testforge.testforge_backend.testsuite.entity;
import com.testforge.testforge_backend.domain.TestScenario; import jakarta.persistence.*;
@Entity @Table(name="test_suite_scenario") public class TestSuiteScenario {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="test_suite_id",nullable=false) private TestSuite testSuite;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="scenario_id",nullable=false) private TestScenario scenario;
 @Column(name="item_order",nullable=false) private Integer itemOrder;
 public TestSuiteScenario(){} public TestSuiteScenario(TestScenario s,Integer o){scenario=s;itemOrder=o;} public Long getId(){return id;} public void setTestSuite(TestSuite v){testSuite=v;} public TestScenario getScenario(){return scenario;} public Integer getItemOrder(){return itemOrder;}
}
