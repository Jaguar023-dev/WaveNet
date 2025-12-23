// In authSlice.js - Check these specific lines:
.addCase(login.fulfilled, (state, action) => {
  console.log('✅ Login fulfilled - User:', action.payload.user?.username);
  
  state.loading = false;
  state.user = action.payload.user;
  
  // CRITICAL: Make sure this line uses 'accessToken' not 'token'
  state.token = action.payload.accessToken; // ← MUST be accessToken
  
  state.isAuthenticated = true;
  
  // Save to localStorage immediately
  localStorage.setItem('token', action.payload.accessToken);
})

.addCase(register.fulfilled, (state, action) => {
  console.log('✅ Register fulfilled - User:', action.payload.user?.username);
  
  state.loading = false;
  state.user = action.payload.user;
  
  // CRITICAL: Make sure this line uses 'accessToken' not 'token'
  state.token = action.payload.accessToken; // ← MUST be accessToken
  
  state.isAuthenticated = true;
  
  // Save to localStorage immediately
  localStorage.setItem('token', action.payload.accessToken);
})