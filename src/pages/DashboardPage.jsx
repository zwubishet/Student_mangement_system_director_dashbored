import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const DirectorDashBoared = () =>{
    const navigate = Navigate();
    const [user, setUser] = useState("");

    useEffect(()=>{
        const token = localStorage.getItem("authToken");

        if(!token){
            navigate('/login');
        }else{
            setUser(
                {
                    userName: "Jhone",
                    role: "Director"
                }
            );
        }
    }), [navigate];

    const logout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (!user) {
    return <p>Loading...</p>;
  }
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>Username: {user.username}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>

      {/* Add more content for the dashboard here */}
      <div>
        <h2>Admin Dashboard</h2>
        {user.role === 'admin' ? (
          <p>You have admin privileges.</p>
        ) : (
          <p>You are a regular user.</p>
        )}
      </div>
    </div>
  );
};

export default DirectorDashBoared;
  
