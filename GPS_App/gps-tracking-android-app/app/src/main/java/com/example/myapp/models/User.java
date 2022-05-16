package com.example.myapp.models;


public class User {
    private long imei;
    private double latitude;
    private double longitude;

    public User(long imei, double latitude, double longitude) {
        this.imei = imei;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public long getImei() {
        return imei;
    }


    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

}
