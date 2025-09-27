import { Ionicons } from "@expo/vector-icons";
import { Button } from "@tamagui/button";
import { Card } from "@tamagui/card";
import { Text } from "@tamagui/core";
import { Input } from "@tamagui/input";
import { Label } from "@tamagui/label";
import { XStack, YStack } from "@tamagui/stacks";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyFilters } from "../types/Property";

const { width: screenWidth } = Dimensions.get("window");
const DRAWER_WIDTH = screenWidth * 0.85;

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onApplyFilters: (filters: PropertyFilters) => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterDrawerProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleClose = () => {
    runOnJS(onClose)();
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: PropertyFilters = {};
    setLocalFilters(resetFilters);
  };

  const propertyTypes = [
    { value: "apartment", label: "Apartamento" },
    { value: "house", label: "Casa" },
    { value: "studio", label: "Studio" },
    { value: "commercial", label: "Comercial" },
  ] as const;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
          },
          overlayStyle,
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: "#f8f9fa",
          },
          drawerStyle,
        ]}
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$4"
            paddingTop={insets.top + 16}
            backgroundColor="$orange9"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            <Text fontSize="$6" fontWeight="bold" color="white">
              Filtros
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </XStack>

          {/* Content */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <YStack padding="$4" gap="$5">
              {/* Price Range */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Faixa de Preço
                  </Text>
                  
                  <XStack gap="$3" alignItems="center">
                    <YStack flex={1}>
                      <Label fontSize="$3" color="$gray11">
                        Mínimo
                      </Label>
                      <Input
                        placeholder="R$ 0"
                        value={localFilters.minPrice?.toString() || ""}
                        onChangeText={(text) =>
                          setLocalFilters({
                            ...localFilters,
                            minPrice: text ? parseInt(text.replace(/\D/g, "")) : undefined,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </YStack>
                    
                    <YStack flex={1}>
                      <Label fontSize="$3" color="$gray11">
                        Máximo
                      </Label>
                      <Input
                        placeholder="R$ 10.000"
                        value={localFilters.maxPrice?.toString() || ""}
                        onChangeText={(text) =>
                          setLocalFilters({
                            ...localFilters,
                            maxPrice: text ? parseInt(text.replace(/\D/g, "")) : undefined,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </YStack>
                  </XStack>
                </YStack>
              </Card>

              {/* Property Type */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Tipo de Imóvel
                  </Text>
                  
                  <XStack flexWrap="wrap" gap="$2">
                    {propertyTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            type: localFilters.type === type.value ? undefined : type.value,
                          })
                        }
                      >
                        <YStack
                          backgroundColor={
                            localFilters.type === type.value ? "$blue10" : "$gray2"
                          }
                          paddingHorizontal="$4"
                          paddingVertical="$3"
                          borderRadius="$4"
                          borderWidth={1}
                          borderColor={
                            localFilters.type === type.value ? "$blue10" : "$borderColor"
                          }
                        >
                          <Text
                            color={
                              localFilters.type === type.value ? "white" : "$color"
                            }
                            fontWeight="500"
                          >
                            {type.label}
                          </Text>
                        </YStack>
                      </TouchableOpacity>
                    ))}
                  </XStack>
                </YStack>
              </Card>

              {/* Bedrooms */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Quartos
                  </Text>
                  
                  <XStack gap="$2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            bedrooms: localFilters.bedrooms === num ? undefined : num,
                          })
                        }
                      >
                        <YStack
                          backgroundColor={
                            localFilters.bedrooms === num ? "$blue10" : "$gray2"
                          }
                          width={50}
                          height={50}
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="$4"
                          borderWidth={1}
                          borderColor={
                            localFilters.bedrooms === num ? "$blue10" : "$borderColor"
                          }
                        >
                          <Text
                            color={
                              localFilters.bedrooms === num ? "white" : "$color"
                            }
                            fontWeight="600"
                          >
                            {num}+
                          </Text>
                        </YStack>
                      </TouchableOpacity>
                    ))}
                  </XStack>
                </YStack>
              </Card>

              {/* Bathrooms */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Banheiros
                  </Text>
                  
                  <XStack gap="$2">
                    {[1, 2, 3, 4].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            bathrooms: localFilters.bathrooms === num ? undefined : num,
                          })
                        }
                      >
                        <YStack
                          backgroundColor={
                            localFilters.bathrooms === num ? "$blue10" : "$gray2"
                          }
                          width={50}
                          height={50}
                          alignItems="center"
                          justifyContent="center"
                          borderRadius="$4"
                          borderWidth={1}
                          borderColor={
                            localFilters.bathrooms === num ? "$blue10" : "$borderColor"
                          }
                        >
                          <Text
                            color={
                              localFilters.bathrooms === num ? "white" : "$color"
                            }
                            fontWeight="600"
                          >
                            {num}+
                          </Text>
                        </YStack>
                      </TouchableOpacity>
                    ))}
                  </XStack>
                </YStack>
              </Card>

              {/* Area */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Área (m²)
                  </Text>
                  
                  <XStack gap="$3" alignItems="center">
                    <YStack flex={1}>
                      <Label fontSize="$3" color="$gray11">
                        Mínimo
                      </Label>
                      <Input
                        placeholder="30"
                        value={localFilters.minArea?.toString() || ""}
                        onChangeText={(text) =>
                          setLocalFilters({
                            ...localFilters,
                            minArea: text ? parseInt(text) : undefined,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </YStack>
                    
                    <YStack flex={1}>
                      <Label fontSize="$3" color="$gray11">
                        Máximo
                      </Label>
                      <Input
                        placeholder="500"
                        value={localFilters.maxArea?.toString() || ""}
                        onChangeText={(text) =>
                          setLocalFilters({
                            ...localFilters,
                            maxArea: text ? parseInt(text) : undefined,
                          })
                        }
                        keyboardType="numeric"
                      />
                    </YStack>
                  </XStack>
                </YStack>
              </Card>

              {/* Location */}
              <Card padding="$4" backgroundColor="$background">
                <YStack gap="$3">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    Localização
                  </Text>
                  
                  <Input
                    placeholder="Digite o bairro ou região"
                    value={localFilters.location || ""}
                    onChangeText={(text) =>
                      setLocalFilters({
                        ...localFilters,
                        location: text || undefined,
                      })
                    }
                  />
                </YStack>
              </Card>
            </YStack>
          </ScrollView>

          {/* Footer Actions */}
          <YStack
            padding="$4"
            backgroundColor="$background"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            gap="$3"
          >
            <XStack gap="$3">
              <Button
                flex={1}
                variant="outlined"
                borderColor="$gray8"
                color="$gray11"
                onPress={handleReset}
              >
                Limpar Filtros
              </Button>
              
              <Button
                flex={2}
                backgroundColor="$orange9"
                color="white"
                onPress={handleApply}
              >
                Aplicar Filtros
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Animated.View>
    </Modal>
  );
}
