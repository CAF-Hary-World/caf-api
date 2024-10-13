import axios from 'axios';

const knowledgeApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL +
    `/v1/entities:search?key=${process.env.GOOGLE_KNOWLEDGE_GRAPH_API_KEY}&indent=True&limit=5`,
});

const brandApi = axios.create({
  baseURL: process.env.BRAND_API_URL + `/v2`,
  headers: {
    Authorization: `Bearer ${process.env.BRAND_API_KEY}`,
  },
});

async function knowledgeQuery(query: string) {
  const search = await knowledgeApi.get(`&query=${query}`);
  return search;
}

async function getBrandByName({ name }: { name: string }) {
  const brand = await brandApi.get(`/search/${name}`);
  return brand;
}

async function getBrandByDomain({ domain }: { domain: string }) {
  const brand = await brandApi.get(`/brands/${domain}`);
  return brand;
}

export {
  knowledgeApi,
  knowledgeQuery,
  brandApi,
  getBrandByName,
  getBrandByDomain,
};
