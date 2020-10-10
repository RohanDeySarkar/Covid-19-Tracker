import React from 'react';
import numeral from "numeral";
import './Table.css';

function Table({countries}) {
    return (
        <div className="table">
            {countries.map((country) => (
                <tr>
                    <td>{country.country}</td>
                    <td>{numeral(country.cases).format("0,0")}</td>
                </tr>
            ))}
        </div>
    )
}

export default Table
