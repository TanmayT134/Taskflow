package com.taskflow.taskflow_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI taskflowOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Taskflow API")
                        .description(
                                "REST API documentation for Taskflow - "
                                + "a full-stack task management application "
                                + "built using Spring Boot, Spring Data JPA "
                                + "and MySQL."
                        )
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Taskflow Development Team")
                                .email("support@taskflow.local")
                        )
                        .license(new License()
                                .name("Development Project")
                        )
                );
    }
}