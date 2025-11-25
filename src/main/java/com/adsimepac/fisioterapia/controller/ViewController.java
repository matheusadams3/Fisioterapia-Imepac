package com.adsimepac.fisioterapia.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "index"; // Mapeia para o novo template index.html
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/pacientes")
    public String pacientes() {
        return "pacientes";
    }

    @GetMapping("/calendario")
    public String calendario() {
        return "calendario";
    }
}
