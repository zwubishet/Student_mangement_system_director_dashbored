import React from "react";
import "../style/table.css"; // Assuming you have a table.css file for styling

const WorkTable = ({ data }) => {
    return (
        <div className="tableContainer">
            <h2>Top Performer</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Grade</th>
                        <th>Average</th>
                        <th>Rank</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            <td>{row.name}</td>
                            <td>{row.grade}</td>
                            <td>{row.average}</td>
                            <td>{row.rank}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WorkTable;
