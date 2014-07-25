package com.bdu.homeguard;

import com.ibm.mobile.services.data.IBMDataObject;
import com.ibm.mobile.services.data.IBMDataObjectSpecialization;

import android.util.Log;

@IBMDataObjectSpecialization("User")
public class User extends IBMDataObject{
	
	public static final String CLASS_NAME = "User";
	
	private String username;
	private String password;

	public User(String username, String password) {
		this.username = username;
		this.password = password;
	}
	
	public String getUsername(){
		return this.username;
	}
	
	public void setUsername(String username){
		this.username = username;
	}
	
	public String getPassword(){
		return this.password;
	}
	
	public void setPassword(String password){
		this.password = password;
	}
	
	public String toString(){
		String theUsername = "";
		theUsername = getUsername();
		return theUsername;
	}

}
