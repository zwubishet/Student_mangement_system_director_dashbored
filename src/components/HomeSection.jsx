import { Card } from "../views/card";
import "../style/homeSection.css"
import LineChart from "../views/lineChart";
import PieChart from "../views/pieChart";
import StudentPerformace from "../views/performaceTable";

const HomeSection = ()=>{
        const employeesData = [
        { name: "John Doe", grade: "7", average: "99.1", rank: "1st" },
        { name: "Jane Smith", grade: "7", average: "98.8", rank: "2nd" },
        { name: "Samuel Brown", grade: "8", average: "97.1", rank: "3rd" },
        { name: "Lucy Green", grade: "6", average: "95", rank: "4th" }
    ];
    return (
        <div className="homeSectionContainer">
            <div className="header">
                <Card name={"Total Student"} value={"2300"}/>
                <Card name={"Total Teachers"} value={"65"}/>
                <Card name={"Total Employee"} value={"2500"}/>
                <Card name={"Year Budget"} value={"3.5 mill"}/>
            </div>
            <div className="separeterLine"></div>
            <div className="midSection">
                <div class = "statusShow">
                    <LineChart/>
                    <PieChart/>
                </div>
                <StudentPerformace data={employeesData}/>
            </div>
            <div className="buttonSection">

            </div>
        </div>
    );
}

export default HomeSection;