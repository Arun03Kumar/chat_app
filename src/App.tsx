import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import ChatCenter from "./app/ChatCenter";
import Layout from "./app/Layout";
import Header from "./app/Header";
import { LoginForm } from "./components/login-form";
import Page from "./app/login/page";

function App() {
  return (
    <>
      <div>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Page />
          {/* <Layout>
            <Header />
            <ChatCenter />
          </Layout> */}
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
