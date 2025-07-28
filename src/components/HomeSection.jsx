import { Card } from "../views/card";
import "../style/homeSection.css"

const HomeSection = ()=>{
    return (
        <div className="homeSectionContainer">
            <div className="header">
                <Card name={"Total Student"} value={"2300"}/>
                <Card name={"Total Teachers"} value={"2300"}/>
                <Card name={"Year Budget"} value={"2300"}/>
            </div>
            <div className="midSection">

            </div>
            <div className="buttonSection">

            </div>
        </div>
    );
}

export default HomeSection;