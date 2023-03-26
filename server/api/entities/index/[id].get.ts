export default defineEventHandler(async (event) => {
  try {
    const id = event.context?.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Missing id",
      });
    }
    const entity = await prisma.entity.findUnique({
      where: {
        id: id,
      },
      include: {
        countries: true,
        topics: true,
        media: {
          orderBy: { resource_type: "asc" },
        },
      },
    });
    if (!entity) {
      throw createError({
        statusCode: 404,
        message: "Entity not found",
      });
    }
    // get related products based on the topics & countries
    const products = await prisma.entity.findMany({
      where: {
        type: "Product",
        id: { not: id },
        OR: [
          {
            topicIds: { hasSome: entity.topicIds },
            countryIds: { hasSome: entity.countryIds },
          },
        ],
      },
      include: {
        media: {
          orderBy: {
            resource_type: "asc",
          },
        },
      },
      take: 5,
    });
    return { entity, products };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }
});
