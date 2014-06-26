package com.example.homeguard;

import android.app.Activity;
import android.content.Intent;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.ActionBar;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.support.v4.widget.DrawerLayout;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.VideoView;

public class MainActivity extends ActionBarActivity 
	implements NavigationDrawerFragment.NavigationDrawerCallbacks{
	
    private NavigationDrawerFragment mNavigationDrawerFragment;
	
	private CharSequence mTitle;

	public void onCreate(Bundle savedInstanceState){
		
//		//Bad debugging technique:
//        Toast.makeText(getApplicationContext(), "Potato.", Toast.LENGTH_SHORT).show();
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
		mNavigationDrawerFragment = (NavigationDrawerFragment)
				getSupportFragmentManager().findFragmentById(R.id.navigation_drawer);
		mTitle = getTitle();
		
		VideoView stream = (VideoView) findViewById(R.layout.stream);
		LinearLayout deviceTitle = (LinearLayout) findViewById(R.layout.device_title);
		RelativeLayout activeDeviceItem = (RelativeLayout) findViewById(R.layout.active_device_item);
		RelativeLayout idleDeviceItem = (RelativeLayout) findViewById(R.layout.idle_device_item);
		RelativeLayout unreachableDeviceItem = (RelativeLayout) findViewById(R.layout.unreachable_device_item);
		

		// Set up the drawer.
		mNavigationDrawerFragment.setUp(
				R.id.navigation_drawer,	
				(DrawerLayout) findViewById(R.id.drawer_layout));
	}

	public void onNavigationDrawerItemSelected(int position) {
		// update the main content by replacing fragments
		FragmentManager fragmentManager = getSupportFragmentManager();
		fragmentManager.beginTransaction()
			.replace(R.id.container, PlaceholderFragment.newInstance(position + 1))
			.commit();
	}

	public void onSectionAttached(int number) {
		switch (number) {
		case 1:
			mTitle = getString(R.string.screenshot);
			break;
		case 2:
			mTitle = getString(R.string.settings);
			break;
		case 3:
			mTitle = getString(R.string.logout);
			break;
		}
	}
	
	public void restoreActionBar() {
		ActionBar actionBar = getSupportActionBar();
		actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_STANDARD);
		actionBar.setDisplayShowTitleEnabled(true);
        actionBar.setTitle(mTitle);
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		if (!mNavigationDrawerFragment.isDrawerOpen()) {
			//	Only show items in the action bar relevant to this screen
			// if the drawer is not showing. Otherwise, let the drawer
			// decide what to show in the action bar.
			getMenuInflater().inflate(R.menu.main, menu);
			restoreActionBar();
			return true;
		}
		return super.onCreateOptionsMenu(menu);
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		//Settings menu at the top bar
		int id = item.getItemId();
		if (id == R.id.action_settings) {
			Intent settings = new Intent(MainActivity.this,SettingsActivity.class);
			startActivity(settings);
		}
		return super.onOptionsItemSelected(item);
	}
	
	public static class PlaceholderFragment extends Fragment {
        /**
         * The fragment argument representing the section number for this
         * fragment.
         */
        private static final String ARG_SECTION_NUMBER = "section_number";

        /**
         * Returns a new instance of this fragment for the given section
         * number.
         */
        public static PlaceholderFragment newInstance(int sectionNumber) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            Bundle args = new Bundle();
            args.putInt(ARG_SECTION_NUMBER, sectionNumber);
            fragment.setArguments(args);
            return fragment;
        }

        public PlaceholderFragment() {
        }

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.fragment_main, container, false);
            TextView textView = (TextView) rootView.findViewById(R.id.section_label);
            textView.setText(Integer.toString(getArguments().getInt(ARG_SECTION_NUMBER)));
            return rootView;
        }

        @Override
        public void onAttach(Activity activity) {
            super.onAttach(activity);
            ((MainActivity) activity).onSectionAttached(
                    getArguments().getInt(ARG_SECTION_NUMBER));
        }
    }
}
