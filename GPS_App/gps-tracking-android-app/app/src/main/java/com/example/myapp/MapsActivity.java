package com.example.myapp;

import android.location.Location;
import android.os.Bundle;

import androidx.fragment.app.FragmentActivity;

import com.example.myapp.databinding.ActivityMapsBinding;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.Polyline;
import com.google.android.gms.maps.model.PolylineOptions;

import java.util.ArrayList;
import java.util.List;

public class MapsActivity extends FragmentActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    List<Location> saveLocations;
    Polyline polyline = null;

    List<LatLng> latLng1 = new ArrayList<>();

    private ActivityMapsBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityMapsBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        MyApplication myApplication = (MyApplication)getApplicationContext();
        saveLocations = myApplication.getMyLocations();

    }

    /**
     * Manipulates the map once available.
     * This callback is triggered when the map is ready to be used.
     * This is where we can add markers or lines, add listeners or move the camera. In this case,
     * we just add a marker near Sydney, Australia.
     * If Google Play services is not installed on the device, the user will be prompted to install
     * it inside the SupportMapFragment. This method will only be triggered once the user has
     * installed Google Play services and returned to the app.
     */
    @Override
    public void onMapReady(GoogleMap googleMap) {
        mMap = googleMap;

        // Add a marker in Sydney and move the camera
        LatLng giessen = new LatLng(50.5841, 8.6784);
        //mMap.addMarker(new MarkerOptions().position(giessen).title("Marker in Giessen"));
        //mMap.moveCamera(CameraUpdateFactory.newLatLng(giessen));

        for (Location location: saveLocations
             ) {
                LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());

                latLng1.add(latLng);

                System.out.println("------------------------------------------------------------");
                System.out.println(latLng1);
                System.out.println("------------------------------------------------------------");

                MarkerOptions markerOptions = new MarkerOptions();
                markerOptions.position(latLng);
                markerOptions.title("Lat: " + location.getLatitude() + " Lon: " + location.getLongitude() + " time: " + location.getTime() );
                mMap.addMarker(markerOptions);


        }


        PolylineOptions polylineOptions = new PolylineOptions().addAll(latLng1);
        polyline = mMap.addPolyline(polylineOptions);
        polyline.setWidth(5);
        polyline.setPoints(latLng1);
        polyline.getPoints();
        polyline.setColor(0);

    }



}