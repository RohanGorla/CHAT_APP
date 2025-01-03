import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";

function Profile() {
  /* SPECIAL VARIABLES */
  const { socket, notifications } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  return (
    <div className="Profile_Page">
      <div className="Profile">
        <div className="Profile--Image">
          <IoMdPerson className="Profile--Image--Icon" />
        </div>
        <div className="Profile--Details">
          <div className="Profile--Credential_Container">
            <div className="Profile--Show_Credential">
              <p className="Profile--Credential">{userData.username}</p>
              <div className="Profile--Edit_Credential_Button">
                <MdModeEditOutline className="Profile--Edit_Credential_Button--Icon" />
              </div>
            </div>
          </div>
          <div className="Profile--Credential_Container">
            <div className="Profile--Show_Credential">
              <p className="Profile--Credential">{userData.userId}</p>
              <div className="Profile--Edit_Credential_Button">
                <MdModeEditOutline className="Profile--Edit_Credential_Button--Icon" />
              </div>
            </div>
          </div>
          <div className="Profile--Credential_Container">
            <div className="Profile--Show_Credential">
              <p className="Profile--Credential">{userData.mail}</p>
              <div className="Profile--Edit_Credential_Button">
                <MdModeEditOutline className="Profile--Edit_Credential_Button--Icon" />
              </div>
            </div>
          </div>
          <div className="Profile--Credential_Container">
            <div className="Profile--Show_Credential">
              <p className="Profile--Credential">********</p>
              <div className="Profile--Edit_Credential_Button">
                <MdModeEditOutline className="Profile--Edit_Credential_Button--Icon" />
              </div>
            </div>
          </div>
        </div>
        <div className="Profile--Logout">
          <button className="Profile--Logout_Button">Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
