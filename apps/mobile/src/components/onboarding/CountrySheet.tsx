import { useMemo, useState } from 'react';
import { FlatList, Pressable, View, useWindowDimensions } from 'react-native';
import { LEVEL_WORDS, PICKER_COUNTRIES } from '@/lib/registers';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { Field, Sheet } from '@/ui/Controls';
import { Icon } from '@/ui/Icon';
import { tap } from '@/ui/Surfaces';
import { T } from '@/ui/Text';

type Item = { code: string; name: string; sub: string };

const ANY: Item = { code: '', name: 'Any country', sub: 'Search every register Vero can reach' };
const ALL: Item[] = [ANY, ...PICKER_COUNTRIES.map((item) => ({ code: item.code, name: item.name, sub: LEVEL_WORDS[item.coverage] }))];

/** The Search board's "Where is it registered?" sheet: every country, with how much Vero can check there. */
export function CountrySheet({ open, value, onClose, onPick }: { open: boolean; value: string; onClose: () => void; onPick: (code: string) => void }) {
  const { c } = useTheme();
  const { height } = useWindowDimensions();
  const [filter, setFilter] = useState('');
  const items = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return ALL;
    return ALL.filter((item) => item.code !== '' && (item.name.toLowerCase().includes(needle) || item.code.toLowerCase() === needle));
  }, [filter]);

  return (
    <Sheet open={open} onClose={onClose} label="Where is it registered?">
      <T variant="h2" accessibilityRole="header" style={{ fontSize: 20, lineHeight: 25 }}>
        Where is it registered?
      </T>
      <T variant="sub" style={{ marginTop: 4 }}>
        Vero scans companies in any country. Coverage tells you how much it can check there.
      </T>
      <Field
        icon="search"
        accessibilityLabel="Find a country"
        placeholder="Find a country"
        value={filter}
        onChangeText={setFilter}
        autoCorrect={false}
        style={{ marginTop: 16, height: 48 }}
      />
      <View style={{ marginTop: 12, height: Math.min(420, height * 0.46), borderRadius: radius.card, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.dark ? 'rgba(18,26,120,0.45)' : c.card, overflow: 'hidden' }}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.code || 'any'}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={14}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: c.line2 }} />}
          ListEmptyComponent={
            <T variant="small" center style={{ padding: 22 }}>
              No country by that name. Try its English name.
            </T>
          }
          renderItem={({ item }) => {
            const on = item.code === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${item.name}, ${item.sub}`}
                onPress={() => {
                  tap();
                  onPick(item.code);
                  setTimeout(() => {
                    onClose();
                    setFilter('');
                  }, 220);
                }}
              >
                {({ pressed }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 18, minHeight: 56, backgroundColor: pressed ? c.rowPressed : 'transparent' }}>
                    <View style={{ flex: 1 }}>
                      <T weight={700} size={15} style={{ lineHeight: 20 }}>
                        {item.name}
                      </T>
                      <T variant="small" style={{ marginTop: 2 }}>
                        {item.sub}
                      </T>
                    </View>
                    <View style={{ opacity: on ? 1 : 0 }}>
                      <Icon name="check" size={20} color={c.navy} />
                    </View>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Sheet>
  );
}
