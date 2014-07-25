package com.bdu.homeguard;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.res.AssetManager;
import android.os.Bundle;
import android.util.Log;

import com.ibm.mobile.services.core.IBMBluemix;
import com.ibm.mobile.services.data.IBMData;
import com.ibm.mobile.services.data.IBMDataObject;
import com.ibm.mobile.services.data.IBMDataObjectSpecialization;

public final class MobileHomeGuard extends Application {
	
	private static final String APP_ID = "applicationID";
	private static final String APP_SECRET = "applicationSecret";
	private static final String APP_ROUTE = "applicationRoute";
	private static final String PROPS_FILE = "mobilehomeguard.properties";
	
	public static final int EDIT_ACTIVITY_RC = 1;
	private static final String CLASS_NAME = MobileHomeGuard.class.getSimpleName();
	List<Item> itemList;

	public MobileHomeGuard() {
		//Debug logging
		registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {
			
			@Override
			public void onActivityStopped(Activity activity) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivityStarted(Activity activity) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivitySaveInstanceState(Activity activity, Bundle outState) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivityResumed(Activity activity) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivityPaused(Activity activity) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivityDestroyed(Activity activity) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
				Log.d(CLASS_NAME, "Activity created: " + activity.getLocalClassName());
				//Initialize the SDK
				IBMBaaS.initializeSDK(activity);
				
			}
		});
	}
	
	@Override
	public void onCreate() {
		super.onCreate();
		itemList = new ArrayList<Item>();
		Item.registerSpecialization(Item.class);
		
		Properties props = new java.util.Properties();
		Context context = getApplicationContext();
		
		try{
			AssetManager assetManager = context.getAssets();
			props.load(assetManager.open(PROPS_FILE));
			Log.i(CLASS_NAME, "Found configuration file: " + PROPS_FILE);
		}catch(FileNotFoundException e){
			Log.e(CLASS_NAME, "The mobilehomeguard.properties was not found.",e);
		}catch (IOException e){
			Log.e(CLASS_NAME, "The mobilehomeguard.properties file could not be read properly.",e);
		}
		
		//Initialize the IBM core backed-as-a-service
		IBMBluemix.initialize(this, props.getProperty(APP_ID), props.getProperty(APP_SECRET), props.getProperty(APP_ROUTE));
		
		//Initializing the IBM data service
		IBMData.initializeService();
		
		//register the Item Specialization
		Item.registerSpecialization(Item.class);
	}
	
	@IBMDataObjectSpecialization("Item")
	public class Item extends IBMDataObject{
		public static final String CLASS_NAME = "Item";
		private static final String NAME = "name";
		
		public String getName(){
			return (String) getObject(NAME);
		}
		
		public void setName(String itemName){
			setObject(NAME,(itemName != null)? itemName: "");
		}
	}
	
	/**
	 * Returns the itemList, an array of Item objects.
	 * @return itemList
	 */
	public List<Item> getItemList() {
		return itemList;
	}
	
	public void setItemList(List<Item> list) {
		itemList = list;
	}
}
