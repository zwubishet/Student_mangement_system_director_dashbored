import React from "react";
import "../style/button.css"

export const Button = ({name}) =>{
    return <div className="btn">
        <h3>{name}</h3>
    </div>
}