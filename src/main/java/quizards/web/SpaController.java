package quizards.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/", "/auth", "/login", "/register", "/create", "/library", "/study-set/{id:[a-f0-9\\-]+}"})
    public String index() {
        return "forward:/index.html";
    }
}
