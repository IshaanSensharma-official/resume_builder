import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        user: null,
        loading: true
    },
    reducers: {
        login: (state, action) => {
            state.token = action.payload.token
            state.user = action.payload.user
        },
        logout: (state) => {
            state.token = null
            state.user = null
            localStorage.removeItem('token')  // ✅ was removeItem('')
        },
        setLoading: (state, action) => {  // ✅ was missing (state, action)
            state.loading = action.payload
        }
    }
})

export const { login, logout, setLoading } = authSlice.actions
export default authSlice.reducer