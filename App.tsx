import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
  Image, StyleSheet, SafeAreaView 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// screen 1 categres 
const CategoryScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products/categories')
      .then(res => res.json())
      .then(json => {
        setCategories(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('Products', { categoryName: item })}
          >
            <Text style={styles.categoryText}>{item.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

// screen 2 product list
const ProductListScreen = ({ route, navigation }: any) => {
  const { categoryName } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://fakestoreapi.com/products/category/${categoryName}`)
      .then(res => res.json())
      .then(json => {
        setProducts(json);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={({ item }: any) => (
          <TouchableOpacity 
            style={styles.productItem} 
            onPress={() => navigation.navigate('Details', { productId: item.id })}
          >
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.price}>${item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// screen product detail
const ProductDetailScreen = ({ route }: any) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);

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
    </View>
  );
};

// navigation
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Categories" component={CategoryScreen} options={{ title: 'Fake Store' }} />
        <Stack.Screen name="Products" component={ProductListScreen} options={({ route }: any) => ({ title: route.params.categoryName.toUpperCase() })} />
        <Stack.Screen name="Details" component={ProductDetailScreen} options={{ title: 'Product Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  centered: { flex: 1, justifyContent: 'center' },
  card: { padding: 20, backgroundColor: '#f9f9f9', marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  categoryText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  productItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  thumb: { width: 60, height: 60, marginRight: 15 },
  info: { flex: 1, justifyContent: 'center' },
  productTitle: { fontSize: 16 },
  price: { fontSize: 14, color: 'green', fontWeight: 'bold' },
  detailImage: { width: '100%', height: 300, marginBottom: 20 },
  detailTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  detailPrice: { fontSize: 20, color: 'green', marginBottom: 10 },
  detailDesc: { fontSize: 16, color: '#444' }
});