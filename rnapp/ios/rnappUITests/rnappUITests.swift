//
//  rnappUITests.swift
//  rnappUITests
//
//  Created by Connor Larkin on 8/29/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import XCTest

class rnappUITests: XCTestCase {
        
    override func setUp() {
        super.setUp()
        
        // Put setup code here. This method is called before the invocation of each test method in the class.
        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false
        // UI tests must launch the application that they test. Doing this in setup will make sure it happens for each test method.
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testHome() {
        // Use recording to get started writing UI tests.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
      sleep(2)
      doLogin()
      let app = XCUIApplication()
      let meohjjme = app.descendants(matching: .button).containing(.button, identifier: "Home").element(boundBy: 0) // second upgrade button-containing element
      meohjjme.tap()
      
      sleep(2)
      snapshot("Home")
    }
  
  func testDIV() {
    // Use recording to get started writing UI tests.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    sleep(2)
    
    doLogin()
    let app = XCUIApplication()
   
    let meohjjme = app.descendants(matching: .button).containing(.button, identifier: "History").element(boundBy: 0) // second upgrade button-containing element
        meohjjme.tap()
    sleep(7)
    
    sleep(9)
    let meohme = app.descendants(matching: .staticText).containing(.staticText, identifier: "TTESTME").element(boundBy: 0)
    
    meohme.tap()

    sleep(9)
    snapshot("DIV")
  }
  
  func testSettings() {
    // Use recording to get started writing UI tests.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    sleep(2)
    doLogin()
    let app = XCUIApplication()
    let meohjjme = app.descendants(matching: .button).containing(.button, identifier: "Settings").element(boundBy: 0) // second upgrade button-containing element
    meohjjme.tap()
    
    sleep(4)
    snapshot("Settings")
  }
  
  func testStats() {
    // Use recording to get started writing UI tests.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    sleep(2)
    doLogin()
    let app = XCUIApplication()
    let meohjjme = app.descendants(matching: .button).containing(.button, identifier: "History").element(boundBy: 0) // second upgrade button-containing element
    meohjjme.tap()
    sleep(6)
    snapshot("History")
  }
  
  func testTotals() {
    // Use recording to get started writing UI tests.
    // Use XCTAssert and related functions to verify your tests produce the correct results.
    sleep(2)
    doLogin()
    let app = XCUIApplication()
  
    //app.otherElements["sfe"].tap()
   // app.otherElements["Home History Settings"].tap()
    let meohjjme = app.descendants(matching: .button).containing(.button, identifier: "History").element(boundBy: 0) // second upgrade button-containing element

    meohjjme.tap()
    sleep(8)
    let meohme = app.descendants(matching: .staticText).containing(.staticText, identifier: "TTESTME").element(boundBy: 0)

    meohme.swipeLeft()
    sleep(4)
    snapshot("Totals")
  }
  
  func doLogin(){
    
    sleep(5)
    let app = XCUIApplication()
    let allowBtn = app.buttons["Allow"]
    if allowBtn.exists {
      allowBtn.tap()
    }
    sleep(2)
    if allowBtn.exists {
      allowBtn.tap()
    }
  
    print(app.otherElements.debugDescription)
    sleep(8)
    
    
    
    let loginButtonContainer = app.descendants(matching: .other).containing(.other, identifier: "23135thisisit").element(boundBy: 0) // second upgrade button-containing element

    
    
    if (loginButtonContainer.exists){
      let button = app.buttons.matching(identifier: "23135thisisit").element(boundBy: 0)
     // button.tap()
      app.otherElements["23135thisisit"].tap()
      
     // self.tapElementAndWaitForKeyboardToAppear(element: app.otherElements["53252345234513324 21234122355431"])
      //app.otherElements["53252345234513324ww"].element(boundBy: 1).doubleTap()
     // app.otherElements["53252345234513324ww"].element(boundBy: 1).doubleTap()
      //UIPasteboard.general.string = "dev"
      // test code
      let upgradeButtonContainer = app.descendants(matching: .textField).element(boundBy: 0) // second upgrade button-containing element
      //let upgradeButton = upgradeButtonContainer.buttons["345325235"]
      
      //self.tapElementAndWaitForKeyboardToAppear(element: upgradeButtonContainer)
      upgradeButtonContainer.tap()
      let meohme = app.descendants(matching: .any).matching(identifier: "delete").element(boundBy: 0)
      let meohmy = app.descendants(matching: .key).element(boundBy: 1)
 
      upgradeButtonContainer.doubleTap()
       UIPasteboard.general.string = "seed"
      app.menuItems.element(boundBy: 0).tap()
     
     // upgradeButtonContainer.typeText("dev")
      
     
      //
      
  //    app.menuItems.element(boundBy: 0).tap()
      let upgreeadeButtonContainer = app.descendants(matching: .textField).element(boundBy: 1) // second upgrade button-containing element

      self.tapElementAndWaitForKeyboardToAppear(element: upgreeadeButtonContainer)
      
      upgreeadeButtonContainer.doubleTap()
      app.menuItems.element(boundBy: 0).tap()
      print(meohme)
     // upgreeadeButtonContainer.typeText("dev")
  
      upgreeadeButtonContainer.typeText("\n")
      let upgreeadfreButtonContainer = app.descendants(matching: .other).element(boundBy: 19)
      print(upgreeadfreButtonContainer)
      
      upgreeadfreButtonContainer.tap()
      sleep(3)
    }
  }
}

extension XCTestCase {
  
  func tapElementAndWaitForKeyboardToAppear(element: XCUIElement) {
    let keyboard = XCUIApplication().keyboards.element
    while (element.exists) {
      element.tap()
      if keyboard.exists {
        break;
      }
      RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.5))
    }
  }
}
