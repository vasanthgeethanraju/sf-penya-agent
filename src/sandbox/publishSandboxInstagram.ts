type PublishSandboxInstagramInput = {
  posterUrl: string;
  caption: string;
};

type PublishSandboxInstagramResult = {
  mediaId: string;
  creationId: string;
  imageUrl: string;
};

async function waitForMediaReady(
  creationId: string,
  accessToken: string
): Promise<void> {
  const maxAttempts = 10;
  const delayMs = 3000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `https://graph.instagram.com/${creationId}` +
        `?fields=status_code&access_token=${accessToken}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Instagram status check error:",
        data
      );

      throw new Error(
        "Failed to check Instagram media status"
      );
    }

    console.log(
      `Instagram media status (${attempt}/${maxAttempts}):`,
      data.status_code
    );

    if (data.status_code === "FINISHED") {
      return;
    }

    if (data.status_code === "ERROR") {
      throw new Error(
        "Instagram failed to process the media"
      );
    }

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  throw new Error(
    "Instagram media was not ready before timeout"
  );
}

export async function publishSandboxInstagram(
  input: PublishSandboxInstagramInput
): Promise<PublishSandboxInstagramResult> {
  const accessToken =
    process.env.INSTAGRAM_SANDBOX_ACCESS_TOKEN;

  const instagramAccountId =
    process.env.INSTAGRAM_SANDBOX_ACCOUNT_ID;

  if (!accessToken) {
    throw new Error(
      "Missing INSTAGRAM_SANDBOX_ACCESS_TOKEN"
    );
  }

  if (!instagramAccountId) {
    throw new Error(
      "Missing INSTAGRAM_SANDBOX_ACCOUNT_ID"
    );
  }

  const imageUrl = input.posterUrl;

  console.log(
    "Instagram poster URL:",
    imageUrl
  );

  // 1. Create Instagram media container
  const createParams =
    new URLSearchParams({
      image_url: imageUrl,
      caption: input.caption,
      access_token: accessToken,
    });

  const createResponse = await fetch(
    `https://graph.instagram.com/${instagramAccountId}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: createParams,
    }
  );

  const createData =
    await createResponse.json();

  if (!createResponse.ok) {
    console.error(
      "Instagram container error:",
      createData
    );

    throw new Error(
      "Failed to create Instagram media container"
    );
  }

  const creationId = createData.id;

  if (!creationId) {
    throw new Error(
      "Instagram did not return a creation ID"
    );
  }

  console.log(
    "Instagram creation ID:",
    creationId
  );

  // 2. Wait until Instagram finishes processing the image
  await waitForMediaReady(
    creationId,
    accessToken
  );

  // 3. Publish the media container
  const publishParams =
    new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken,
    });

  const publishResponse = await fetch(
    `https://graph.instagram.com/${instagramAccountId}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: publishParams,
    }
  );

  const publishData =
    await publishResponse.json();

  if (!publishResponse.ok) {
    console.error(
      "Instagram publish error:",
      publishData
    );

    throw new Error(
      "Failed to publish Instagram post"
    );
  }

  return {
    mediaId: publishData.id,
    creationId,
    imageUrl,
  };
}