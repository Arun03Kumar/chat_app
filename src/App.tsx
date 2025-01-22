import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import ChatCenter from "./app/ChatCenter";
import Layout from "./app/Layout";
import Header from "./app/Header";

function App() {
  return (
    <>
      <div>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Layout>
            <Header />
            <ChatCenter />
          </Layout>
        </ThemeProvider>
      </div>
    </>
  );
}

export default App;
