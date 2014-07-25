package com.bdu.homeguard;

import java.util.List;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import bolts.Continuation;
import bolts.Task;

import com.bdu.homeguard.MobileHomeGuard.Item;
import com.example.homeguard.R;
import com.ibm.mobile.services.data.IBMDataException;
import com.ibm.mobile.services.data.IBMDataObject;
import com.ibm.mobile.services.data.IBMQuery;

//public class MainActivity extends ActionBarActivity
//        implements NavigationDrawerFragment.NavigationDrawerCallbacks {
public class LoginActivity extends ActionBarActivity {

	// private NavigationDrawerFragment mNavigationDrawerFragment;

	protected static final String CLASS_NAME = "LoginActivity";
	List<Item> itemList;
	MobileHomeGuard mobileHomeGuard;
	ArrayAdapter<Item> lvArrayAdapter;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.login_activity);

		getSupportActionBar().hide();

		Button btLogin = (Button) findViewById(R.id.btLogin);
		TextView forgotPassword = (TextView) findViewById(R.id.textForgotPassword);
		final EditText textUsername = (EditText) findViewById(R.id.textUsername);
		final EditText textPassword = (EditText) findViewById(R.id.textPassword);

		// -------- OnClickListener for the "Login" button
		btLogin.setOnClickListener(new View.OnClickListener() {

			// On click on the button "Login", starts login process
			public void onClick(View v) {

				if (textUsername.getText().toString().trim().length() <= 0) {
					Toast.makeText(getApplicationContext(),
							"How 'bout a username?", Toast.LENGTH_SHORT).show();
				} else if (textPassword.getText().toString().trim().length() <= 0) {
					Toast.makeText(getApplicationContext(),
							"What if a u put password bro?", Toast.LENGTH_SHORT)
							.show();
				} else {
					// Here the magic happens
					
					createLogin(v);
					Intent intent = new Intent(LoginActivity.this,
							MainActivity.class);
					startActivity(intent);
				}
			}
		});

		// -------- OnClickListener for the "Forgot Password" button
		forgotPassword.setOnClickListener(new View.OnClickListener() {

			@Override
			public void onClick(View v) {
				// Opens browser if user clicks on "Forgot Password"
				Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri
						.parse("http://homeguard.mybluemix.net/"));
				startActivity(browserIntent);
			}
		});

		// mNavigationDrawerFragment = (NavigationDrawerFragment)
		// getSupportFragmentManager().findFragmentById(R.id.navigation_drawer);
		// mTitle = getTitle();

		// // Set up the drawer.
		// mNavigationDrawerFragment.setUp(
		// R.id.navigation_drawer,
		// (DrawerLayout) findViewById(R.id.drawer_layout));
	}

	public void createLogin(View v){
    	 final EditText itemToAdd = (EditText) findViewById(R.id.textUsername);
//         final EditText textPassword = (EditText) findViewById(R.id.textPassword);
         
         String toAdd = itemToAdd.getText().toString();
         Item item = new Item();
         
		if (!toAdd.equals("")) {

			item.setName(toAdd);
			item.save().continueWith(new Continuation<IBMDataObject, Void>(){
				
				@Override
				public Void then(Task<IBMDataObject>task) throws Exception{
					if (task.isFaulted()){
						Log.e(CLASS_NAME, "Exception: " + task.getError().getMessage());
						return null;
					}
				
					if(!isFinishing()){
						listItems();
					}
					return null;
				}
			});
			itemToAdd.setText("");
		}
	}

	public void listItems() {
		try {
			IBMQuery<Item> query = IBMQuery.queryForClass(Item.class);
			// Query all the Item objects from the server
			query.find().continueWith(new Continuation<List<Item>, Void>() {

				@Override
				public Void then(Task<List<Item>> task) throws Exception {
					// Log error message, if the save task fail.
					if (task.isFaulted()) {
						Log.e(CLASS_NAME, "Exception : "
								+ task.getError().getMessage());
						return null;
					}
					final List<Item> objects = task.getResult();

					// If the result succeeds, load the list
					if (!isFinishing()) {
						runOnUiThread(new Runnable() {
							public void run() {
								// clear local itemList
								// we'll be reordering and repopulating from
								// DataService
								itemList.clear();
								for (IBMDataObject item : objects) {
									itemList.add((Item) item);
								}
								lvArrayAdapter.notifyDataSetChanged();
							}
						});
					}
					return null;
				}
			});

		} catch (IBMDataException error) {
			Log.e(CLASS_NAME, "Exception : " + error.getMessage());
		}
	}

	// @Override
	// public void onNavigationDrawerItemSelected(int position) {
	// // update the main content by replacing fragments
	// FragmentManager fragmentManager = getSupportFragmentManager();
	// fragmentManager.beginTransaction()
	// .replace(R.id.container, PlaceholderFragment.newInstance(position + 1))
	// .commit();
	// }

	// public void onSectionAttached(int number) {
	// switch (number) {
	// case 1:
	// mTitle = getString(R.string.title_section1);
	// break;
	// case 2:
	// mTitle = getString(R.string.title_section2);
	// break;
	// case 3:
	// mTitle = getString(R.string.title_section3);
	// break;
	// }
	// }

	// public void restoreActionBar() {
	// ActionBar actionBar = getSupportActionBar();
	// actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_STANDARD);
	// actionBar.setDisplayShowTitleEnabled(true);
	// actionBar.setTitle(mTitle);
	// }

	// @Override
	// public boolean onCreateOptionsMenu(Menu menu) {
	// if (!mNavigationDrawerFragment.isDrawerOpen()) {
	// // Only show items in the action bar relevant to this screen
	// // if the drawer is not showing. Otherwise, let the drawer
	// // decide what to show in the action bar.
	// getMenuInflater().inflate(R.menu.main, menu);
	// restoreActionBar();
	// return true;
	// }
	// return super.onCreateOptionsMenu(menu);
	// }

	// @Override
	// public boolean onOptionsItemSelected(MenuItem item) {
	// // Handle action bar item clicks here. The action bar will
	// // automatically handle clicks on the Home/Up button, so long
	// // as you specify a parent activity in AndroidManifest.xml.
	// int id = item.getItemId();
	// if (id == R.id.action_settings) {
	// return true;
	// }
	// return super.onOptionsItemSelected(item);
	// }

	/**
	 * A placeholder fragment containing a simple view.
	 */
	public static class PlaceholderFragment extends Fragment {
		/**
		 * The fragment argument representing the section number for this
		 * fragment.
		 */
		private static final String ARG_SECTION_NUMBER = "section_number";

		/**
		 * Returns a new instance of this fragment for the given section number.
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
			View rootView = inflater.inflate(R.layout.fragment_main, container,
					false);
			TextView textView = (TextView) rootView
					.findViewById(R.id.section_label);
			textView.setText(Integer.toString(getArguments().getInt(
					ARG_SECTION_NUMBER)));
			return rootView;
		}

		// @Override
		// public void onAttach(Activity activity) {
		// super.onAttach(activity);
		// ((MainActivity) activity).onSectionAttached(
		// getArguments().getInt(ARG_SECTION_NUMBER));
		// }
	}

}
