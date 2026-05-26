import React from "react";
import User from "./User";

function Users() {
  return (
    <div style={{maxHeight:"calc(84vh - 10vh)"}} className="py-2 flex-prince overflow-y-auto">
      
      <User></User>
      <User></User>
      <User></User>
      <User></User>
      <User></User>
      <User></User>
    </div>
  );
}

export default Users;
