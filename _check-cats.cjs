// Quick script to check what categories exist in the DB
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local
const envPath = '.env.local';
const env = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}=(.+)`));
    return match ? match[1].trim() : null;
};

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const key = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!url || !key) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(url, key);

async function main() {
    const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, piece_type, gender, sort_order')
        .order('sort_order', { ascending: true });

    if (error) { console.error('Error:', error.message); process.exit(1); }

    console.log('\n=== ALL CATEGORIES IN DB ===\n');
    console.log('Total:', data.length);

    const parents = data.filter(c => !c.parent_id);
    const children = data.filter(c => c.parent_id);

    for (const p of parents) {
        console.log(`\n▶ ${p.name} (slug: ${p.slug}, piece_type: ${p.piece_type})`);
        const kids = children.filter(c => c.parent_id === p.id);
        for (const k of kids) {
            console.log(`  └─ ${k.name} | slug: "${k.slug}" | piece_type: "${k.piece_type}" | sort: ${k.sort_order}`);
        }
    }

    const types = [...new Set(data.map(d => d.piece_type).filter(Boolean))].sort();
    console.log('\n=== UNIQUE piece_type values ===');
    console.log(types.join(', '));
}

main();
