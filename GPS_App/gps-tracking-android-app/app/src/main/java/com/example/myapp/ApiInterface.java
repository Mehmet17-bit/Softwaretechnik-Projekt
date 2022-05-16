package com.example.myapp;

import com.example.myapp.models.DataSet;
import com.example.myapp.models.RegisterUser;
import com.example.myapp.models.User;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface ApiInterface {

    String BASE_URL = "http://seg-swtp-ubuntu.mni.thm.de:4001/";


    // For simple client that sends data

    @POST("/post")
    Call<User> getUserInformation(@Body User user);

    @POST("/register")
    Call<RegisterUser> registerUser(@Body RegisterUser user);


    // For admin using admin interface

    @GET("/auth")
    Call<String> getAuth(@Header("username")String username , @Header("password")String password);

    @GET("/current")
    Call<DataSet[]> getCurrent(@Header("token")String token);

    @GET("/history")
    Call<DataSet[]> getHistory(@Header("token")String token);

    @GET("/users")
    Call<String> getUsers(@Header("token")String token);

    @GET("/zones")
    Call<String> getZones(@Header("token")String token);

}
