import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "English";
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
  }, [theme, language]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, changeLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };