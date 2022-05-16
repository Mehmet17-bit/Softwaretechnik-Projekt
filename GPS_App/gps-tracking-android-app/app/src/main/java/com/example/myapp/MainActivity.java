package com.example.myapp;

import android.content.Intent;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.myapp.models.RegisterUser;
import com.example.myapp.models.RetrofitClient;
import com.google.android.material.button.MaterialButton;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


public class MainActivity extends AppCompatActivity {

    List<RegisterUser> register = new ArrayList<>();
    static long globalImei = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //find our objects from the .xml

        TextView username = findViewById(R.id.username);
        TextView password = findViewById(R.id.password);
        TextView user = findViewById(R.id.userEdit);
        TextView imeiEdit = findViewById(R.id.imeiEdit);

        MaterialButton loginbtn = findViewById(R.id.loginbtn);
        MaterialButton userbtn = findViewById(R.id.userbtn);





        // our Click handle function
        loginbtn.setOnClickListener(view -> getAuth(username.getText().toString(), password.getText().toString()));


        userbtn.setOnClickListener(v -> {

            registerUser(Long.valueOf(imeiEdit.getText().toString()), user.getText().toString());
            RegisterUser u1 = new RegisterUser(Long.valueOf(imeiEdit.getText().toString()), user.getText().toString());
            register.add(u1);

            for (RegisterUser u : register){
                if(u.getImei() == Long.valueOf(imeiEdit.getText().toString()) && u.getName().equals(user.getText().toString())) {

                    globalImei =  Long.valueOf(imeiEdit.getText().toString());

                    starteZweiteSeite();

                }
            }

        });

    }


    //the change_page function
    public void starteZweiteSeite(){
        Intent intent = new Intent(this, secondActivity.class);
        startActivity(intent);
    }

    public void starteMaps(){
        Intent intent = new Intent(this,MapsActivity.class);
        startActivity(intent);
    }


    //getAuth

    public void getAuth(String username, String password){
        Call<String> call = RetrofitClient.getInstance().getMyAPI().getAuth(username,password);

        call.enqueue(new Callback<String>() {
            @Override
            public void onResponse(Call<String> call, Response<String> response) {
                if (response.code() == 200){
                    //parsing delivered token for authentication in object
                    try {
                        JSONObject jsonResponse = new JSONObject(response.body().toString());
                        RetrofitClient.setToken(jsonResponse.getString("token"));
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    //starting maps screen
                    starteMaps();
                    Toast.makeText(MainActivity.this, "Login successful" , Toast.LENGTH_SHORT).show();
                }else
                {
                    Toast.makeText(MainActivity.this, "Invalid credentials" , Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<String> call, Throwable t) {
                Log.i("OK","error " + t.getMessage());
            }
        });
    }

    // User register
    public void registerUser(long imei, String name){
        RegisterUser user = new RegisterUser(imei, name);
        Call<RegisterUser> call = RetrofitClient.getInstance().getMyAPI().registerUser(user);
        call.enqueue(new Callback<RegisterUser>() {
            @Override
            public void onResponse(Call<RegisterUser> call, Response<RegisterUser> response) {
                Log.i("OK", "Register: " + response.body());
                Log.i("OK", "Code: " + response.code());
            }

            @Override
            public void onFailure(Call<RegisterUser> call, Throwable t) {
                Log.i("OK","error " + t.getMessage());
            }
        });

    }


}