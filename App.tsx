import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  Image, StyleSheet, SafeAreaView, Alert 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

// redux 
const cartSlice = createSlice({
  name: 'cart',
    initialState: { items: [] as any[] },  reducers: {
    addToCart: (state, action) => {
      const itemExists = state.items.find((item: any) => item.id === action.payload.id);
      if (itemExists) {
        itemExists.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    incrementQuantity: (state, action) => {
      const item = state.items.find((item: any) => item.id === action.payload);
      if (item) item.quantity += 1;
    },
    decrementQuantity: (state, action) => {
      const item = state.items.find((item: any) => item.id === action.payload);
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter((i: any) => i.id !== action.payload);
        } else {
          item.quantity -= 1;
        }
      }
    }
  }
});

const { addToCart, incrementQuantity, decrementQuantity } = cartSlice.actions;
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//  screen 1 nd 2
const CategoryScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products/categories')
      .then(res => res.json())
      .then(json => { setCategories(json); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductsList', { categoryName: item })}>
            <Text style={styles.categoryText}>{item.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const ProductListScreen = ({ route, navigation }: any) => {
  const { categoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/category/${categoryName}`)
      .then(res => res.json())
      .then(json => { setProducts(json); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('Details', { productId: item.id })}>
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.info}><Text style={styles.productTitle}>{item.title}</Text><Text style={styles.price}>${item.price}</Text></View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// product detal
const ProductDetailScreen = ({ route }: any) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/${productId}`)
      .then(res => res.json())
      .then(json => setProduct(json));
  }, []);

  if (!product) return <ActivityIndicator size="large" style={styles.centered} />;

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.detailImage} resizeMode="contain" />
      <Text style={styles.detailTitle}>{product.title}</Text>
      <Text style={styles.detailPrice}>${product.price}</Text>
      <Text style={styles.detailDesc}>{product.description}</Text>
      
      <TouchableOpacity 
        style={styles.cartButton} 
        onPress={() => {
          dispatch(addToCart(product));
          Alert.alert("Success", "Added to cart!");
        }}
      >
        <Text style={styles.cartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

// shopping cart
const ShoppingCartScreen = () => {
  const cartItems = useSelector((state: any) => state.cart.items);
  const dispatch = useDispatch();

  const totalCost = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return <View style={styles.centered}><Text style={styles.emptyText}>Your shopping cart is empty</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Items: {totalItems}</Text>
        <Text style={styles.summaryText}>Total Cost: ${totalCost.toFixed(2)}</Text>
      </View>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartRow}>
            <Image source={{ uri: item.image }} style={styles.cartThumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cartItemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cartItemPrice}>${item.price}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => dispatch(decrementQuantity(item.id))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => dispatch(incrementQuantity(item.id))} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

function ProductStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CategoriesList" component={CategoryScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductsList" component={ProductListScreen} options={({ route }: any) => ({ title: route.params.categoryName.toUpperCase() })} />
      <Stack.Screen name="Details" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen 
            name="Products" 
            component={ProductStack} 
            options={{ tabBarLabel: 'Products', tabBarIcon: () => <Text>📦</Text> }} 
          />
          <Tab.Screen 
            name="Cart" 
            component={ShoppingCartScreen} 
            options={{ 
              headerShown: true,
              tabBarLabel: 'Shopping Cart', 
              tabBarIcon: () => <Text>🛒</Text>,
              tabBarBadge: store.getState().cart.items.length > 0 ? store.getState().cart.items.reduce((s:any, i:any) => s + i.quantity, 0) : undefined
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  categoryText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  productItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  thumb: { width: 60, height: 60, marginRight: 15 },
  info: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 16 },
  price: { fontSize: 14, color: 'green', fontWeight: 'bold' },
  detailImage: { width: '100%', height: 250, marginBottom: 20 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  detailPrice: { fontSize: 18, color: 'green', marginBottom: 10 },
  detailDesc: { fontSize: 14, color: '#444', marginBottom: 20 },
  cartButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center' },
  cartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { fontSize: 18, color: '#888' },
  summaryContainer: { padding: 15, backgroundColor: '#eee', borderRadius: 8, marginBottom: 10 },
  summaryText: { fontSize: 18, fontWeight: 'bold' },
  cartRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  cartThumb: { width: 50, height: 50, marginRight: 15 },
  cartItemTitle: { fontSize: 14, fontWeight: 'bold' },
  cartItemPrice: { color: 'green' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qtyBtn: { padding: 5, backgroundColor: '#ddd', borderRadius: 4, width: 30, alignItems: 'center' },
  qtyText: { marginHorizontal: 15, fontSize: 16 }
});