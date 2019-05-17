import { Reactotron } from "../reactotron-core-client"

export default () => (reactotron: Reactotron) => {
  let myRepl = null

  return {
    onCommand: ({ type, payload }: { type: string; payload?: any }) => {
      if (type !== "repl") return

      reactotron.send(
        "repl.response",
        function() {
          return eval(payload)
        }.call(myRepl)
      )
    },
    features: {
      repl: (thing: object | Function) => {
        myRepl = thing
      },
    },
  }
}
