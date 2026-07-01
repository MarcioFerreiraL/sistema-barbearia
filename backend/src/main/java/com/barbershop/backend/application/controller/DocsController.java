package com.barbershop.backend.application.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DocsController {

    @GetMapping({"/docs", "/docs/"})
    public String redirectToRedoc() {
        return "forward:/redoc.html";
    }
}
