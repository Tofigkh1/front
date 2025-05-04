import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk – Raw material ekleme
export const addRawMaterial = createAsyncThunk(
  'material/addRawMaterial',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://api.smartcafe.az/api/add/raw-materials', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Bir hata oluştu');
    }
  }
);

const materialSlice = createSlice({
  name: 'material',
  initialState: {
    loading: false,
    error: null,
    success: false,
    data: null,
  },
  reducers: {
    resetMaterialState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addRawMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(addRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetMaterialState } = materialSlice.actions;
export default materialSlice.reducer;
