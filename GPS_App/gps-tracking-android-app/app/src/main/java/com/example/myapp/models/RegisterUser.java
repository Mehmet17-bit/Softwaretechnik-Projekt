package com.example.myapp.models;

public class RegisterUser {
    private long imei;
    private String name;

    public RegisterUser(long imei, String name) {
        this.imei = imei;
        this.name = name;
    }

    public long getImei() {
        return imei;
    }

    public void setImei(long imei) {
        this.imei = imei;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
