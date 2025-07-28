import "../style/card.css"

export const Card = ({name, value})=>{
    return <div className="cartMainContainer">
        <h4>{name}</h4>
        <p>{value}</p>
    </div>
}