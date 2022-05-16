package com.example.myapp.models;
import com.example.myapp.ApiInterface;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.converter.scalars.ScalarsConverterFactory;

public class RetrofitClient {

    public static RetrofitClient retrofit = null;
    private ApiInterface myAPI;
    public static String token;

    public static String getToken() {
        return token;
    }

    public static void setToken(String val) {
        token = val;
    }


    private RetrofitClient() {
        Gson gson = new GsonBuilder()
                .setLenient()
                .create();
        Retrofit retrofit = new Retrofit.Builder().baseUrl(myAPI.BASE_URL).addConverterFactory(ScalarsConverterFactory.create()).addConverterFactory(GsonConverterFactory.create(gson)).build();
        myAPI = retrofit.create(ApiInterface.class);


    }

    public static RetrofitClient getInstance(){
        if(retrofit == null){
            retrofit = new RetrofitClient();
        }
        return retrofit;

    }

    public ApiInterface getMyAPI(){
        return myAPI;
    }


}
