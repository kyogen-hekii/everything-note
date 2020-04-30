import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"

import "./App.css"
import NotePage from "./pages/NotePage"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={NotePage} />
        </Switch>
      </BrowserRouter>
    </div>
  )
}
// <Route exact path="/" component={hello}/>

export default App
