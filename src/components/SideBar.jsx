import React from "react";
import { Button } from "../views/button";
import "../style/sideBar.css";
import school from "../assets/student.jpg"
import { Card } from "../views/card";

const SideBar = () =>{
    return (
            <div className="sideBarMainContainer">
                <div className="topSection">
                    <div className="logoSection">
                        <img src={school} alt="school logo" />
                        <div className="schoolName">
                            <h3>Dream School</h3>
                            <p>Your Dream, Our Mission.</p>
                        </div>
                    </div>
                    <div className="separeterLine"></div>
                    <div className="navigations">
                        <Button name = {"Dashboared"}/>
                        <Button name = {"Student"}/>
                        <Button name = {"Teacher"}/>
                        <Button name = {"Analytics"}/>
                        <Button name = {"Settings"}/>
                    </div>
                </div>
                <div className="footerSection">
                    <div>LogOut</div>
                </div>
            </div>
        
    );
}

export default SideBar;