  import React, { useState, useEffect } from 'react';
  import { 
    View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
    Image, StyleSheet, SafeAreaView, Alert, TextInput, Modal
  } from 'react-native';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';
  import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
  import { Provider, useSelector, useDispatch } from 'react-redux';
  import { CONFIG } from './config';
  import { store } from './src/redux/store';
  import { addToCart, incrementQuantity, decrementQuantity } from './src/redux/cartSlice';
  import { loginSuccess, logout, updateProfile } from './src/redux/authSlice';

  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();

  // ==========================================
  // 1. SPLASH SCREEN
  // ==========================================
  const SplashScreen = () => (
    <View style={[styles.centered, { backgroundColor: '#2196F3' }]}>
      <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>Fake Store</Text>
      <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />
    </View>
  );

  // ==========================================
  // 2. AUTHENTICATION & PROFILE SCREENS
  // ==========================================
  const AuthScreen = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleClear = () => {
      setName(''); setEmail(''); setPassword('');
    };

    const handleAuth = async () => {
      try {
        const endpoint = isSignUp ? '/users/signup' : '/users/signin';
        const payload = isSignUp
          ? { name, email, password }
          : { email, password };

        const res = await fetch(`${CONFIG.LOCAL_SERVER_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status !== 'OK') {
          Alert.alert("Error", data.message || "Authentication failed.");
          return;
        }

        dispatch(loginSuccess({
          token: data.token,
          user: { id: data.id, name: data.name, email: data.email }
        }));

        if (isSignUp) {
          Alert.alert("Success", "Registration complete! You are now logged in.");
        }
      } catch (error) {
        Alert.alert("Network Error", "Could not connect to the backend.");
      }
    };

    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isSignUp ? "Sign up a new user" : "Sign in with your email and password"}
          </Text>
          
          {isSignUp && (
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
          )}
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <View style={styles.authButtonRow}>
            <TouchableOpacity style={[styles.authButton, { backgroundColor: '#999' }]} onPress={handleClear}>
              <Text style={styles.actionButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.actionButtonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={{ marginTop: 20 }}>
            <Text style={{ color: '#2196F3', textAlign: 'center' }}>
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  const ProfileScreen = () => {
    const user = useSelector((state: any) => state.auth.user);
    const token = useSelector((state: any) => state.auth.token);
    const dispatch = useDispatch();
    
    const [modalVisible, setModalVisible] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editPassword, setEditPassword] = useState('');

    const handleUpdate = async () => {
      try {
        const response = await fetch(`${CONFIG.LOCAL_SERVER_URL}/users/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ name: editName, password: editPassword || undefined })
        });
        const data = await response.json();
        if (data.status === 'OK') {
          dispatch(updateProfile({ name: editName }));
          Alert.alert("Success", "Profile updated.");
          setModalVisible(false);
        } else {
          Alert.alert("Error", data.message || "Update failed.");
        }
      } catch (e) {
        Alert.alert("Network Error");
      }
    };

    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>User Profile</Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Name: {user?.name}</Text>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Email: {user?.email}</Text>
          
          <TouchableOpacity style={[styles.authButton, { flex: 0, alignSelf: 'stretch' }]} onPress={() => setModalVisible(true)}>
            <Text style={styles.actionButtonText}>Update Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.authButton, { flex: 0, alignSelf: 'stretch', backgroundColor: '#f44336', marginTop: 10 }]} onPress={() => dispatch(logout())}>
            <Text style={styles.actionButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* UPDATE PROFILE MODAL */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.authTitle}>Edit Profile</Text>
              <TextInput style={styles.input} placeholder="New Name" value={editName} onChangeText={setEditName} />
              <TextInput style={styles.input} placeholder="New Password (optional)" value={editPassword} onChangeText={setEditPassword} secureTextEntry />
              <View style={styles.authButtonRow}>
                <TouchableOpacity style={[styles.authButton, { backgroundColor: '#999' }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.authButton} onPress={handleUpdate}>
                  <Text style={styles.actionButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  };

  // Profile Tab Switcher
  const ProfileTab = () => {
    const token = useSelector((state: any) => state.auth.token);
    return token ? <ProfileScreen /> : <AuthScreen />;
  };

  // ==========================================
  // 3. PRODUCT NAVIGATION SCREENS
  // ==========================================
  const CategoryScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      fetch(`${CONFIG.LOCAL_SERVER_URL}/products/categories`)
        .then(res => res.json()).then(json => { setCategories(json); setLoading(false); });
    }, []);
    if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
    return (
      <SafeAreaView style={styles.container}>
        <FlatList data={categories} keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ProductsList', { categoryName: item })}>
              <Text style={styles.categoryText}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          )} />
      </SafeAreaView>
    );
  };

  const ProductListScreen = ({ route, navigation }: any) => {
    const { categoryName } = route.params;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      fetch(`${CONFIG.LOCAL_SERVER_URL}/products/category/${encodeURIComponent(categoryName)}`)
        .then(res => res.json()).then(json => { setProducts(json); setLoading(false); });
    }, []);
    if (loading) return <ActivityIndicator size="large" style={styles.centered} />;
    return (
      <View style={styles.container}>
        <FlatList data={products} keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }: any) => (
            <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('Details', { productId: item.id })}>
              <Image source={{ uri: `${CONFIG.LOCAL_SERVER_URL}${item.image}` }} style={styles.thumb} />
              <View style={styles.info}><Text style={styles.productTitle}>{item.title}</Text><Text style={styles.price}>${item.price}</Text></View>
            </TouchableOpacity>
          )} />
      </View>
    );
  };

  const ProductDetailScreen = ({ route }: any) => {
    const { productId } = route.params;
    const [product, setProduct] = useState<any>(null);
    const dispatch = useDispatch();
    useEffect(() => {
      fetch(`${CONFIG.LOCAL_SERVER_URL}/products/${productId}`)
        .then(res => res.json()).then(json => setProduct(json));
    }, []);
    if (!product) return <ActivityIndicator size="large" style={styles.centered} />;
    return (
      <View style={styles.container}>
        <Image source={{ uri: `${CONFIG.LOCAL_SERVER_URL}${product.image}` }} style={styles.detailImage} resizeMode="contain" />
        <Text style={styles.detailTitle}>{product.title}</Text>
        <Text style={styles.detailPrice}>${product.price}</Text>
        <Text style={styles.detailDesc}>{product.description}</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => { dispatch(addToCart(product)); Alert.alert("Success", "Added to cart!"); }}>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
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

  // ==========================================
  // 4. SHOPPING CART
  // ==========================================
  const ShoppingCartScreen = () => {
    const cartItems = useSelector((state: any) => state.cart.items);
    const token = useSelector((state: any) => state.auth.token); 
    const dispatch = useDispatch();

    const totalCost = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    const handleCheckout = async () => {
      try {
        const response = await fetch(`${CONFIG.LOCAL_SERVER_URL}/orders/neworder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            items: cartItems.map((item: any) => ({ prodID: item.id, price: item.price, quantity: item.quantity }))
          })
        });
        const data = await response.json();
        if (data.status === 'OK') {
          Alert.alert("Success", "Order created! Check the Orders tab.");
        } else {
          Alert.alert("Error", data.message || "Could not create order.");
        }
      } catch (error) { Alert.alert("Network Error"); }
    };

    if (cartItems.length === 0) return <View style={styles.centered}><Text style={styles.emptyText}>Your shopping cart is empty</Text></View>;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Total Items: {totalItems}</Text>
          <Text style={styles.summaryText}>Total Cost: ${totalCost.toFixed(2)}</Text>
        </View>
        <FlatList data={cartItems} keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartRow}>
              <Image source={{ uri: `${CONFIG.LOCAL_SERVER_URL}${item.image}` }} style={styles.cartThumb} />
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
          )} />
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  // ==========================================
  // 5. ORDERS SCREEN (Categorized & Collapsible)
  // ==========================================
  const OrdersScreen = () => {
    const token = useSelector((state: any) => state.auth.token);
    const [orders, setOrders] = useState<any[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${CONFIG.LOCAL_SERVER_URL}/orders/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (data.status === 'OK') setOrders(data.orders);
      } catch (error) { console.log(error); }
    };

    useEffect(() => { fetchOrders(); }, [token]);

    const updateOrderStatus = async (orderId: number, action: 'pay' | 'receive') => {
      try {
        const response = await fetch(`${CONFIG.LOCAL_SERVER_URL}/orders/updateorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ orderID: orderId, isPaid: 1, isDelivered: action === 'receive' ? 1 : 0 })
        });
        const data = await response.json();
        if (data.status === 'OK') {
          Alert.alert("Success", "Order status updated.");
          fetchOrders();
        } else {
          Alert.alert("Error", data.message || "Could not update order.");
        }
      } catch (error) { Alert.alert("Error updating order"); }
    };

    const renderOrderList = (label: string, isPaidFilter: number, isDeliveredFilter: number) => {
      const filteredOrders = orders.filter(o => o.is_paid === isPaidFilter && o.is_delivered === isDeliveredFilter);
      if (filteredOrders.length === 0) return null;

      return (
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.categoryHeader}>{label} Orders</Text>
          {filteredOrders.map(item => {
            const isExpanded = expandedId === item.id;
            const orderItems = (() => { try { return JSON.parse(item.order_items); } catch { return []; } })();

            return (
              <View key={item.id} style={styles.orderCard}>
                <TouchableOpacity style={styles.orderSummary} onPress={() => setExpandedId(isExpanded ? null : item.id)}>
                  <View>
                    <Text style={styles.orderIdText}>Order #{item.id}</Text>
                    <Text style={{color: '#666'}}>{item.item_numbers} items | ${Number(item.total_price).toFixed(2)}</Text>
                  </View>
                  <Text style={{ fontSize: 20 }}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.orderExpandedArea}>
                    {orderItems.map((prod: any, idx: number) => (
                      <Text key={idx} style={{ marginVertical: 2 }}>• Product #{prod.prodID} x{prod.quantity} @ ${prod.price}</Text>
                    ))}

                    {item.is_paid === 0 && (
                      <TouchableOpacity style={styles.actionButton} onPress={() => updateOrderStatus(item.id, 'pay')}>
                        <Text style={styles.actionButtonText}>Pay Now</Text>
                      </TouchableOpacity>
                    )}
                    {item.is_paid === 1 && item.is_delivered === 0 && (
                      <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={() => updateOrderStatus(item.id, 'receive')}>
                        <Text style={styles.actionButtonText}>Mark as Received</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={[{}]}
          keyExtractor={() => "dummy"}
          renderItem={() => (
            <View>
              {renderOrderList('New', 0, 0)}
              {renderOrderList('Paid', 1, 0)}
              {renderOrderList('Delivered', 1, 1)}
              {orders.length === 0 && <Text style={styles.emptyText}>No orders found.</Text>}
            </View>
          )}
        />
      </SafeAreaView>
    );
  };

  // ==========================================
  // 6. ROOT APP & TAB NAVIGATOR
  // ==========================================
  const MainApp = () => {
    const [isSplashVisible, setSplashVisible] = useState(true);
    const token = useSelector((state: any) => state.auth.token);
    const cartItems = useSelector((state: any) => state.cart.items);
    const totalCartItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    // Hide splash screen after 2.5 seconds
    useEffect(() => {
      setTimeout(() => setSplashVisible(false), 2500);
    }, []);

    // Intercept tab clicks if the user isn't logged in
    const requireAuth = (e: any) => {
      if (!token) {
        e.preventDefault();
        Alert.alert("Login Required", "Please sign in to access this feature.");
      }
    };

    if (isSplashVisible) return <SplashScreen />;

    return (
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Profile" component={ProfileTab} options={{ tabBarIcon: () => <Text style={{fontSize:20}}>👤</Text> }} />
          
          <Tab.Screen name="Products" component={ProductStack} 
            listeners={{ tabPress: requireAuth }}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>📦</Text> }} />
          
          <Tab.Screen name="Cart" component={ShoppingCartScreen} 
            listeners={{ tabPress: requireAuth }}
            options={{ 
              headerShown: true, 
              tabBarIcon: () => <Text style={{fontSize:20}}>🛒</Text>,
              tabBarBadge: totalCartItems > 0 ? totalCartItems : undefined
            }} />
            
          <Tab.Screen name="Orders" component={OrdersScreen} 
            listeners={{ tabPress: requireAuth }}
            options={{ headerShown: true, tabBarIcon: () => <Text style={{fontSize:20}}>🧾</Text> }} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  };

  export default function App() {
    return (
      <Provider store={store}>
        <MainApp />
      </Provider>
    );
  }

  // ==========================================
  // 7. STYLES
  // ==========================================
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
    emptyText: { fontSize: 18, color: '#888', textAlign: 'center', marginTop: 20 },
    summaryContainer: { padding: 15, backgroundColor: '#eee', borderRadius: 8, marginBottom: 10 },
    summaryText: { fontSize: 18, fontWeight: 'bold' },
    cartRow: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
    cartThumb: { width: 50, height: 50, marginRight: 15 },
    cartItemTitle: { fontSize: 14, fontWeight: 'bold' },
    cartItemPrice: { color: 'green' },
    quantityControls: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    qtyBtn: { padding: 5, backgroundColor: '#ddd', borderRadius: 4, width: 30, alignItems: 'center' },
    qtyText: { marginHorizontal: 15, fontSize: 16 },
    checkoutButton: { backgroundColor: '#FF9800', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    
    // Auth & Profile Styles
    authCard: { width: '90%', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 10, elevation: 3 },
    authTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, backgroundColor: '#fff' },
    authButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    authButton: { flex: 1, backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', padding: 20, backgroundColor: '#fff', borderRadius: 10 },

    // Orders Styles
    categoryHeader: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: '#333' },
    orderCard: { padding: 15, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
    orderSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderIdText: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    orderExpandedArea: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#ddd' },
    actionButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 15 },
  });