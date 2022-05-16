package com.example.myapp;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.example.myapp.models.RegisterUser;
import com.example.myapp.models.RetrofitClient;
import com.example.myapp.models.User;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class secondActivity extends AppCompatActivity {

    private static final int PERMISSIONS_FINE_LOCATION = 99;
    Button btn_newWayPoint, btn_showWayPointList, btn_showMap;

    //variable to remember if we are tracking location or not
    boolean updateOn = false;

    Location currentLocation;

    double old_lat = 0, old_long = 0;

    MapsActivity mapsActivity = new MapsActivity();

    List<Location> savedLocation;

    Thread runner;

    //location request
    LocationRequest locationRequest;
    LocationCallback locationCallBack;

    //for location services
    FusedLocationProviderClient fusedLocationProviderClient;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_second);
        btn_newWayPoint = findViewById(R.id.btn_newWayPoint);
        btn_showWayPointList = findViewById(R.id.btn_showWayPointList);
        btn_showMap = findViewById(R.id.btn_showMap);



        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        // set all properties of LocationRequest
        //how often does the default location check occur
        //how often does the location check occur when set to the most frequent update


        locationRequest = LocationRequest.create();
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        locationRequest.setInterval(1000);


        btn_newWayPoint.setOnClickListener(v -> {

            MyApplication myApplication =(MyApplication) getApplicationContext();

            Runnable locationUpdater = () -> {
                    while(true){
                        try {
                            if(!updateOn){
                                return;
                            }
                            updateGPS();
                            savedLocation = myApplication.getMyLocations();
                            savedLocation.add(currentLocation);
                            postRequest(MainActivity.globalImei, currentLocation.getLatitude() , currentLocation.getLongitude());
                            Log.i("POST", currentLocation.getLatitude() + "  :  " + currentLocation.getLongitude());
                            Thread.sleep(3000);
                        } catch (Exception e) { }
                    }
                };

            if(!updateOn){
                startLocationUpdates();
                runner = new Thread(locationUpdater);
                updateOn = true;
                runner.start();
                btn_newWayPoint.setText("Stop Tracking");
            } else {
                updateOn = false;
                runner.interrupt();
                stopLocationUpdates();
                btn_newWayPoint.setText("Start Tracking");
            }
        });

        btn_showWayPointList.setOnClickListener(v -> {
            Intent i = new Intent(secondActivity.this,ShowSavedLocationsList.class);
            startActivity(i);
        });


        btn_showMap.setOnClickListener(v -> {
            Intent i = new Intent(secondActivity.this, MapsActivity.class );
            startActivity(i);
        });




        updateGPS();

    }


    public void registerUser(long imei, String name){
        RegisterUser user = new RegisterUser(imei, name);
        Call<RegisterUser> call = RetrofitClient.getInstance().getMyAPI().registerUser(user);
        call.enqueue(new Callback<RegisterUser>() {
            @Override
            public void onResponse(Call<RegisterUser> call, Response<RegisterUser> response) {
                Log.i("OK", "Registered user: "+response.body());
                Log.i("OK", "Registered code: "+response.code());
            }

            @Override
            public void onFailure(Call<RegisterUser> call, Throwable t) {
                Log.i("ERROR", t.getMessage());
            }
        });

    }

    public void postRequest(long imei, double latitude, double longitude){

        if(old_lat != latitude || old_long != longitude){
            User user = new User(imei,latitude,longitude);
            Call<User> call = RetrofitClient.getInstance().getMyAPI().getUserInformation(user);
            call.enqueue(new Callback<User>() {
                @Override
                public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                    Log.i("OK", response.code() + ": " + response.body().toString());
                }

                @Override
                public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                    Log.i("ERROR", call.request().toString()+ " "+ t.getMessage());
                }
            });
            old_lat = latitude;
            old_long = longitude;
        }

    }



    private void stopLocationUpdates() {
        fusedLocationProviderClient.removeLocationUpdates(locationCallBack);
    }


    private void startLocationUpdates() {
        HandlerThread handlerThread = new HandlerThread("MyHandlerThread");
        handlerThread.start();
        Looper looper = handlerThread.getLooper();
        fusedLocationProviderClient.requestLocationUpdates(locationRequest, locationCallBack, looper);
        updateGPS();

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode){
            case PERMISSIONS_FINE_LOCATION:
                if(grantResults[0] == PackageManager.PERMISSION_GRANTED){
                    updateGPS();
                }
                else {
                    finish();
                }
                break;
        }
    }

    @SuppressLint("MissingPermission")
    private void updateGPS(){
        //get current location from the fused client and updated the items

        if(ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            locationCallBack = new LocationCallback() {
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    if (locationResult == null) {
                        return;
                    }
                    for (Location location : locationResult.getLocations()) {
                        if (location != null) {
                            currentLocation = location;
                        }
                    }
                }
            };


        }
        else{

            if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.M){
                requestPermissions(new String[] {Manifest.permission.ACCESS_FINE_LOCATION} , PERMISSIONS_FINE_LOCATION);
            }

        }


    }
}

