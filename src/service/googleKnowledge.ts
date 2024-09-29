import axios from 'axios';

const knowledgeApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL +
    `/v1/entities:search?key=${process.env.GOOGLE_KNOWLEDGE_GRAPH_API_KEY}&indent=True&limit=5`,
});

const brandApi = axios.create({
  baseURL: process.env.BRAND_API_URL + ` /v2/search`,
});

async function knowledgeQuery(query: string) {
  const search = await knowledgeApi.get(`&query=${query}`);
  return search;
}

async function getBrand({ name }: { name: string }) {
  const brand = await brandApi.get(`/${name}`);
  return brand;
}

export { knowledgeApi, knowledgeQuery, brandApi, getBrand };
