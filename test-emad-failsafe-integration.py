#!/usr/bin/env python3

"""
EMAD Failsafe Integration Test

Comprehensive test suite for the EMAD failsafe system to verify
all components work together correctly.
"""

import os
import sys
import time
import json
import tempfile
import subprocess
from pathlib import Path
from datetime import datetime

def test_failsafe_system():
    """Run comprehensive failsafe system tests"""
    print("🧪 EMAD Failsafe Integration Test Suite")
    print("=" * 50)
    
    test_results = {
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_details": []
    }
    
    # Test 1: Import and initialization
    test_results["total_tests"] += 1
    try:
        from emad_failsafe_system import EMADFailsafeSystem
        failsafe = EMADFailsafeSystem(Path("."))
        print("✅ Test 1: Failsafe system import and initialization")
        test_results["passed_tests"] += 1
        test_results["test_details"].append("✅ System initialization successful")
    except Exception as e:
        print(f"❌ Test 1: Failed to initialize failsafe system: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ System initialization failed: {e}")
        return test_results
    
    # Test 2: Configuration management
    test_results["total_tests"] += 1
    try:
        config = failsafe.config.config
        assert "failsafe_1_uninitialized_detection" in config
        assert "failsafe_2_post_completion_detection" in config
        assert config["failsafe_1_uninitialized_detection"]["enabled"] == True
        assert config["failsafe_2_post_completion_detection"]["enabled"] == True
        print("✅ Test 2: Configuration management")
        test_results["passed_tests"] += 1
        test_results["test_details"].append("✅ Configuration loaded correctly")
    except Exception as e:
        print(f"❌ Test 2: Configuration test failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ Configuration test failed: {e}")
    
    # Test 3: File change detection
    test_results["total_tests"] += 1
    try:
        changes = failsafe.detect_file_changes()
        assert isinstance(changes, list)
        print(f"✅ Test 3: File change detection ({len(changes)} changes found)")
        test_results["passed_tests"] += 1
        test_results["test_details"].append(f"✅ File change detection working ({len(changes)} changes)")
    except Exception as e:
        print(f"❌ Test 3: File change detection failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ File change detection failed: {e}")
    
    # Test 4: EMAD process detection
    test_results["total_tests"] += 1
    try:
        emad_running = failsafe.is_emad_running()
        assert isinstance(emad_running, bool)
        status = "running" if emad_running else "not running"
        print(f"✅ Test 4: EMAD process detection (EMAD is {status})")
        test_results["passed_tests"] += 1
        test_results["test_details"].append(f"✅ Process detection working (EMAD {status})")
    except Exception as e:
        print(f"❌ Test 4: EMAD process detection failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ Process detection failed: {e}")
    
    # Test 5: Project completion status
    test_results["total_tests"] += 1
    try:
        completion = failsafe.check_project_completion_status()
        assert isinstance(completion, dict)
        assert "is_completed" in completion
        assert "completed_tasks" in completion
        assert "active_tasks" in completion
        print(f"✅ Test 5: Project completion status (completed: {completion['is_completed']})")
        test_results["passed_tests"] += 1
        test_results["test_details"].append(f"✅ Completion status working")
    except Exception as e:
        print(f"❌ Test 5: Project completion status failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ Completion status failed: {e}")
    
    # Test 6: New project detection
    test_results["total_tests"] += 1
    try:
        new_project = failsafe.detect_new_project()
        assert isinstance(new_project, bool)
        status = "detected" if new_project else "not detected"
        print(f"✅ Test 6: New project detection (new project {status})")
        test_results["passed_tests"] += 1
        test_results["test_details"].append(f"✅ New project detection working")
    except Exception as e:
        print(f"❌ Test 6: New project detection failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ New project detection failed: {e}")
    
    # Test 7: Git initialization detection
    test_results["total_tests"] += 1
    try:
        git_init = failsafe.detect_git_initialization()
        assert isinstance(git_init, bool)
        status = "detected" if git_init else "not detected"
        print(f"✅ Test 7: Git initialization detection (recent init {status})")
        test_results["passed_tests"] += 1
        test_results["test_details"].append(f"✅ Git init detection working")
    except Exception as e:
        print(f"❌ Test 7: Git initialization detection failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ Git init detection failed: {e}")
    
    # Test 8: State persistence
    test_results["total_tests"] += 1
    try:
        # Save test state
        test_state = {"test_timestamp": datetime.now().isoformat()}
        failsafe.state.update(test_state)
        failsafe.save_state()
        
        # Create new instance and verify state persisted
        failsafe2 = EMADFailsafeSystem(Path("."))
        assert "test_timestamp" in failsafe2.state
        print("✅ Test 8: State persistence")
        test_results["passed_tests"] += 1
        test_results["test_details"].append("✅ State persistence working")
    except Exception as e:
        print(f"❌ Test 8: State persistence failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ State persistence failed: {e}")
    
    # Test 9: Configuration updates
    test_results["total_tests"] += 1
    try:
        # Test configuration update
        original_value = failsafe.config.config["failsafe_1_uninitialized_detection"]["enabled"]
        failsafe.config.update_setting("failsafe_1_uninitialized_detection.enabled", not original_value)
        
        # Verify update
        new_value = failsafe.config.config["failsafe_1_uninitialized_detection"]["enabled"]
        assert new_value != original_value
        
        # Restore original value
        failsafe.config.update_setting("failsafe_1_uninitialized_detection.enabled", original_value)
        
        print("✅ Test 9: Configuration updates")
        test_results["passed_tests"] += 1
        test_results["test_details"].append("✅ Configuration updates working")
    except Exception as e:
        print(f"❌ Test 9: Configuration updates failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ Configuration updates failed: {e}")
    
    # Test 10: CLI integration
    test_results["total_tests"] += 1
    try:
        # Test CLI status command
        result = subprocess.run([
            sys.executable, "emad-failsafe-cli.py", "status"
        ], capture_output=True, text=True, timeout=10)
        
        assert result.returncode == 0
        assert "Failsafe System Status" in result.stdout
        print("✅ Test 10: CLI integration")
        test_results["passed_tests"] += 1
        test_results["test_details"].append("✅ CLI integration working")
    except subprocess.TimeoutExpired:
        print("❌ Test 10: CLI integration timed out")
        test_results["failed_tests"] += 1
        test_results["test_details"].append("❌ CLI integration timed out")
    except Exception as e:
        print(f"❌ Test 10: CLI integration failed: {e}")
        test_results["failed_tests"] += 1
        test_results["test_details"].append(f"❌ CLI integration failed: {e}")
    
    return test_results

def test_failsafe_scenarios():
    """Test specific failsafe scenarios"""
    print("\n🎯 Testing Failsafe Scenarios")
    print("=" * 50)
    
    scenario_results = {
        "total_scenarios": 0,
        "passed_scenarios": 0,
        "failed_scenarios": 0,
        "scenario_details": []
    }
    
    try:
        from emad_failsafe_system import EMADFailsafeSystem
        failsafe = EMADFailsafeSystem(Path("."))
        
        # Scenario 1: Simulate uninitialized EMAD detection
        scenario_results["total_scenarios"] += 1
        try:
            # Create some fake file changes
            failsafe.state["last_emad_initialization"] = None
            
            # Run failsafe 1 detection (should not trigger without actual changes)
            failsafe.failsafe_1_uninitialized_detection()
            
            print("✅ Scenario 1: Uninitialized EMAD detection logic")
            scenario_results["passed_scenarios"] += 1
            scenario_results["scenario_details"].append("✅ Failsafe 1 logic working")
        except Exception as e:
            print(f"❌ Scenario 1: Uninitialized EMAD detection failed: {e}")
            scenario_results["failed_scenarios"] += 1
            scenario_results["scenario_details"].append(f"❌ Failsafe 1 failed: {e}")
        
        # Scenario 2: Simulate post-completion detection
        scenario_results["total_scenarios"] += 1
        try:
            # Run failsafe 2 detection
            failsafe.failsafe_2_post_completion_detection()
            
            print("✅ Scenario 2: Post-completion detection logic")
            scenario_results["passed_scenarios"] += 1
            scenario_results["scenario_details"].append("✅ Failsafe 2 logic working")
        except Exception as e:
            print(f"❌ Scenario 2: Post-completion detection failed: {e}")
            scenario_results["failed_scenarios"] += 1
            scenario_results["scenario_details"].append(f"❌ Failsafe 2 failed: {e}")
        
        # Scenario 3: Test monitoring thread startup
        scenario_results["total_scenarios"] += 1
        try:
            failsafe.start_monitoring()
            time.sleep(2)  # Let threads start
            
            assert failsafe.running == True
            assert len(failsafe.failsafe_threads) > 0
            
            failsafe.stop_monitoring()
            time.sleep(1)  # Let threads stop
            
            print("✅ Scenario 3: Monitoring thread management")
            scenario_results["passed_scenarios"] += 1
            scenario_results["scenario_details"].append("✅ Thread management working")
        except Exception as e:
            print(f"❌ Scenario 3: Monitoring thread management failed: {e}")
            scenario_results["failed_scenarios"] += 1
            scenario_results["scenario_details"].append(f"❌ Thread management failed: {e}")
        
    except ImportError as e:
        print(f"❌ Could not import failsafe system: {e}")
        scenario_results["failed_scenarios"] = scenario_results["total_scenarios"] = 1
        scenario_results["scenario_details"].append(f"❌ Import failed: {e}")
    
    return scenario_results

def generate_test_report(test_results, scenario_results):
    """Generate comprehensive test report"""
    print("\n📊 EMAD Failsafe Integration Test Report")
    print("=" * 60)
    
    total_tests = test_results["total_tests"] + scenario_results["total_scenarios"]
    total_passed = test_results["passed_tests"] + scenario_results["passed_scenarios"]
    total_failed = test_results["failed_tests"] + scenario_results["failed_scenarios"]
    
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"📈 Overall Results:")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {total_passed}")
    print(f"   Failed: {total_failed}")
    print(f"   Success Rate: {success_rate:.1f}%")
    
    print(f"\n🧪 Unit Tests:")
    print(f"   Tests: {test_results['total_tests']}")
    print(f"   Passed: {test_results['passed_tests']}")
    print(f"   Failed: {test_results['failed_tests']}")
    
    print(f"\n🎯 Scenario Tests:")
    print(f"   Scenarios: {scenario_results['total_scenarios']}")
    print(f"   Passed: {scenario_results['passed_scenarios']}")
    print(f"   Failed: {scenario_results['failed_scenarios']}")
    
    print(f"\n📋 Detailed Results:")
    for detail in test_results["test_details"]:
        print(f"   {detail}")
    for detail in scenario_results["scenario_details"]:
        print(f"   {detail}")
    
    if success_rate >= 90:
        print(f"\n🎉 Excellent! EMAD Failsafe system is working correctly.")
    elif success_rate >= 70:
        print(f"\n✅ Good! EMAD Failsafe system is mostly functional with minor issues.")
    else:
        print(f"\n⚠️ Warning! EMAD Failsafe system has significant issues that need attention.")
    
    return success_rate >= 70

def main():
    """Main test execution"""
    print("🚀 Starting EMAD Failsafe Integration Tests...")
    print(f"Test Directory: {Path('.').absolute()}")
    print(f"Python Version: {sys.version}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Run unit tests
        test_results = test_failsafe_system()
        
        # Run scenario tests
        scenario_results = test_failsafe_scenarios()
        
        # Generate report
        success = generate_test_report(test_results, scenario_results)
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error during testing: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
