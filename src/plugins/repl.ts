import { Reactotron } from "../reactotron-core-client"

interface Repl {
  name: string
  value: any
}

export default () => (reactotron: Reactotron) => {
  const myRepls: Repl[] = []
  let currentContext = null

  return {
    onCommand: ({ type, payload }: { type: string; payload?: any }) => {
      if (type.substr(0, 5) !== "repl.") return

      switch (type.substr(5)) {
        case "ls":
          reactotron.send("repl.ls.response", myRepls.map(r => r.name))
          break
        case "cd":
          const changeTo = myRepls.find(r => r.name === payload)

          if (!changeTo) {
            reactotron.send("repl.cd.response", "That REPL does not exist")
            break
          }

          currentContext = payload

          reactotron.send("repl.cd.response", `Change REPL to "${payload}"`)
          break
        case "execute":
          if (!currentContext) {
            reactotron.send(
              "repl.execute.response",
              "You must first select the REPL to use. Try 'ls'"
            )
            break
          }

          const currentRepl = myRepls.find(r => r.name === currentContext)

          if (!currentRepl) {
            reactotron.send("repl.execute.response", "The selected REPL no longer exists.")
            break
          }

          reactotron.send(
            "repl.execute.response",
            function() {
              return eval(payload)
            }.call(currentRepl.value)
          )
          break
      }
    },
    features: {
      repl: (name: string, value: object | Function) => {
        if (!name) {
          throw new Error("You must provide a name for your REPL")
        }

        if (myRepls.some(r => r.name === name)) {
          throw new Error("You are already REPLing an item with that name")
        }

        myRepls.push({
          name,
          value,
        })
      },
    },
  }
}
