

///////////////// create a Zustand store //////////////////////

import { create } from 'zustand'

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}))



//////////////// use the store in a component /////////////////

function BearCounter() {
  const bears = useStore((state) => state.bears)
  return <h1>{bears} bears around here...</h1>
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}




/////////////////////// complex store example ///////////////////////
import { create } from 'zustand';

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false }
      ]
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter(todo => todo.id !== id)
    }))
}));

