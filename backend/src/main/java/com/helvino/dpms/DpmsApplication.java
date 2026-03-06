package com.helvino.dpms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DpmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(DpmsApplication.class, args);
    }
}
