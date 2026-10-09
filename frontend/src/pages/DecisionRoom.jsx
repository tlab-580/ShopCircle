import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function getProductInsight(product) {
  if (!product) {
    return {
      score: 0,
      strength: "Balanced choice",
      explanation: "Product information is not available.",
    };
  }

  const coding = Number(product.coding ?? 0);
  const gaming = Number(product.gaming ?? 0);
  const battery = Number(product.battery ?? 0);

  const score = Math.round(
    ((coding + gaming + battery) / 30) * 100
  );

  const attributes = [
    { name: "Coding", value: coding },
    { name: "Gaming", value: gaming },
    { name: "Battery", value: battery },
  ];

  const strongest = attributes.reduce(
    (best, current) =>
      current.value > best.value ? current : best,
    attributes[0]
  );

  let explanation = "";

  if (strongest.name === "Coding") {
    explanation = `${product.name} stands out for coding and development work.`;
  } else if (strongest.name === "Gaming") {
    explanation = `${product.name} is the strongest choice for gaming performance.`;
  } else {
    explanation = `${product.name} offers strong battery performance for longer usage.`;
  }

  return {
    score,
    strength: strongest.name,
    explanation,
  };
}
function DecisionRoom() {
  const { roomId } = useParams();
  const location = useLocation();
  const selectedProductId = location.state?.selectedProductId || null;
  const pendingProductKeyRef = useRef(null);

  const [roomName, setRoomName] = useState("");
  const [creatorName, setCreatorName] = useState("");

  const [room, setRoom] = useState(null);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [votingMember, setVotingMember] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const [memberName, setMemberName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [wishlistProducts, setWishlistProducts] = useState([]);

  // ============================================================
  // SAFE API RESPONSE HELPER
  // ============================================================

  const getApiMessage = (response, fallback) => {
    return (
      response?.data?.message ||
      fallback
    );
  };

  // ============================================================
  // LOAD WISHLIST
  // ============================================================

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(
          "shopcircle_wishlist"
        );

      const savedRoomProducts =
        localStorage.getItem(
          "shopcircle_room_products"
        );

      let wishlist = [];

      if (savedRoomProducts) {
        const parsedRoomProducts =
          JSON.parse(savedRoomProducts);

        if (Array.isArray(parsedRoomProducts)) {
          wishlist = parsedRoomProducts;
        }
      }

      if (wishlist.length === 0 && savedWishlist) {
        const parsedWishlist =
          JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          wishlist = parsedWishlist;
        }
      }

      // Remove invalid products and duplicates
      const validWishlist = wishlist
        .filter(
          (product) =>
            product &&
            product.id !== undefined
        )
        .filter(
          (product, index, array) =>
            index ===
            array.findIndex(
              (item) =>
                item.id === product.id
            )
        );

      setWishlistProducts(validWishlist);
    } catch (err) {
      console.error(
        "Unable to load wishlist:",
        err
      );

      setWishlistProducts([]);
    }
  }, []);

  // ============================================================
  // LOAD ALL PRODUCTS
  // ============================================================

  const loadProducts = async () => {
    setProductsLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/products`
      );

      const receivedProducts =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(
              response.data?.products
            )
            ? response.data.products
            : [];

      setProducts(receivedProducts);

      return receivedProducts;
    } catch (err) {
      console.error(
        "Unable to load products:",
        err
      );

      setProducts([]);

      setError(
        "Unable to load products. Make sure the backend is running."
      );

      return [];
    } finally {
      setProductsLoading(false);
    }
  };

  // ============================================================
  // LOAD SHARED ROOM
  // ============================================================

  const loadSharedRoom = async (id) => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.get(
        `${API_URL}/rooms/${id}`
      );

      const receivedRoom =
        response?.data?.room;

      if (!receivedRoom) {
        setRoom(null);

        setError(
          getApiMessage(
            response,
            "Decision Room not found."
          )
        );

        return;
      }

      setRoom(receivedRoom);
      setJoined(false);
      setResult(null);

      await loadProducts();
    } catch (err) {
      console.error(
        "Unable to load room:",
        err
      );

      setRoom(null);

      setError(
        "Unable to load this Decision Room. Check the room link and make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // AUTOMATICALLY LOAD SHARED ROOM
  // ============================================================

  useEffect(() => {
    if (roomId) {
      loadSharedRoom(roomId);
    }
  }, [roomId]);

  // ============================================================
  // ADD WISHLIST PRODUCTS TO ROOM
  // ============================================================

  const addWishlistToRoom = async (
    targetRoom = room
  ) => {
    if (
      !targetRoom ||
      !Array.isArray(wishlistProducts) ||
      wishlistProducts.length === 0
    ) {
      return targetRoom;
    }

    setWishlistLoading(true);
    setError("");
    setMessage("");

    let updatedRoom = targetRoom;
    let addedCount = 0;

    try {
      const existingProducts =
        Array.isArray(updatedRoom.products)
          ? updatedRoom.products
          : [];

      for (const product of wishlistProducts) {
        if (!product?.id) {
          continue;
        }

        const alreadyAdded =
          existingProducts.some(
            (item) =>
              item.id === product.id
          );

        if (alreadyAdded) {
          continue;
        }

        try {
          const response =
            await axios.post(
              `${API_URL}/rooms/add-product`,
              {
                room_id:
                  updatedRoom.room_id,
                product_id: product.id,
              }
            );

          if (response?.data?.room) {
            updatedRoom =
              response.data.room;

            addedCount++;
          }
        } catch (productError) {
          console.error(
            `Unable to add ${product.name}:`,
            productError
          );
        }
      }

      setRoom(updatedRoom);

      if (addedCount > 0) {
        setMessage(
          `${addedCount} wishlist product${
            addedCount !== 1 ? "s" : ""
          } added to the room. ❤️`
        );
      }

      return updatedRoom;
    } catch (err) {
      console.error(err);

      setError(
        "Unable to add wishlist products to the room."
      );

      return updatedRoom;
    } finally {
      setWishlistLoading(false);
    }
  };

  // ============================================================
  // CREATE DECISION ROOM
  // ============================================================

  const createRoom = async () => {
  const cleanRoomName = roomName.trim();
  const cleanCreatorName = creatorName.trim();

  if (!cleanRoomName || !cleanCreatorName) {
    setError(
      "Please enter both room name and your name."
    );
    return;
  }

  setLoading(true);
  setError("");
  setMessage("");

  try {
    // --------------------------------------------------------
    // CREATE ROOM
    // --------------------------------------------------------

    const response = await axios.post(
      `${API_URL}/rooms`,
      {
        room_name: cleanRoomName,
        creator_name: cleanCreatorName,
      }
    );

    if (!response?.data?.room) {
      setError(
        getApiMessage(
          response,
          "Unable to create Decision Room."
        )
      );
      return;
    }

    let createdRoom = response.data.room;

    // --------------------------------------------------------
    // ADD SELECTED PRODUCT FROM PRODUCT DETAILS
    // --------------------------------------------------------

    if (selectedProductId) {
      const productId = Number(selectedProductId);

      const alreadyExists = (
        createdRoom.products || []
      ).some(
        (product) =>
          Number(product.id) === productId
      );

      if (!alreadyExists) {
        try {
          const selectedProductResponse =
            await axios.post(
              `${API_URL}/rooms/add-product`,
              {
                room_id: createdRoom.room_id,
                product_id: productId,
              }
            );

          if (
            selectedProductResponse?.data?.room
          ) {
            createdRoom =
              selectedProductResponse.data.room;

            setMessage(
              "Selected product added to your Decision Room! 🎉"
            );
          }
        } catch (productError) {
          console.error(
            "Unable to add selected product:",
            productError
          );

          setError(
            "Room was created, but the selected product could not be added."
          );
        }
      }
    }

    // --------------------------------------------------------
    // ADD WISHLIST PRODUCTS
    // --------------------------------------------------------

    if (wishlistProducts.length > 0) {
      setWishlistLoading(true);

      let addedCount = 0;

      try {
        for (const product of wishlistProducts) {
          if (!product?.id) {
            continue;
          }

          const productId = Number(product.id);

          const alreadyAdded = (
            createdRoom.products || []
          ).some(
            (item) =>
              Number(item.id) === productId
          );

          // Prevent duplicate products
          if (alreadyAdded) {
            continue;
          }

          try {
            const productResponse =
              await axios.post(
                `${API_URL}/rooms/add-product`,
                {
                  room_id:
                    createdRoom.room_id,
                  product_id: productId,
                }
              );

            if (
              productResponse?.data?.room
            ) {
              createdRoom =
                productResponse.data.room;

              addedCount++;
            }
          } catch (productError) {
            console.error(
              `Unable to add ${product.name}:`,
              productError
            );
          }
        }
      } finally {
        setWishlistLoading(false);
      }

      if (addedCount > 0) {
        setMessage(
          `${addedCount} wishlist product${
            addedCount !== 1 ? "s" : ""
          } added to your Decision Room! ❤️`
        );
      }
    }

    // --------------------------------------------------------
    // FINAL ROOM STATE
    // --------------------------------------------------------

    localStorage.removeItem(
      "shopcircle_room_products"
    );

    setWishlistProducts([]);

    setRoom(createdRoom);

    setJoined(true);

    setVotingMember(
      cleanCreatorName
    );

    // Prevent the automatic useEffect
    // from adding the same product again.
    if (selectedProductId) {
      pendingProductKeyRef.current =
        `${createdRoom.room_id}:${Number(
          selectedProductId
        )}`;
    }

    await loadProducts();

  } catch (err) {
    console.error(
      "Create room error:",
      err
    );

    setError(
      "Unable to create the Decision Room. Make sure the backend is running."
    );
  } finally {
    setLoading(false);
  }
};

  // ============================================================
  // JOIN DECISION ROOM
  // ============================================================

  const joinRoom = async () => {
    if (!roomId || !room) {
      setError(
        "This Decision Room is unavailable."
      );
      return;
    }

    const cleanJoinName =
      joinName.trim();

    if (!cleanJoinName) {
      setError(
        "Please enter your name."
      );
      return;
    }

    setJoinLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await axios.post(
          `${API_URL}/rooms/join`,
          {
            room_id: roomId,
            member_name:
              cleanJoinName,
          }
        );

      if (response?.data?.room) {
        setRoom(response.data.room);
        setJoined(true);
        setVotingMember(
          cleanJoinName
        );

        setMessage(
          response.data.message ||
            "Joined Decision Room successfully."
        );

        await loadProducts();
      } else {
        setError(
          getApiMessage(
            response,
            "Unable to join room."
          )
        );
      }
    } catch (err) {
      console.error(
        "Join room error:",
        err
      );

      setError(
        "Unable to join this Decision Room."
      );
    } finally {
      setJoinLoading(false);
    }
  };

  // ============================================================
  // ADD PRODUCT
  // ============================================================

  const addProductToRoom = async (
    productId
  ) => {
    if (!room) {
      return;
    }

    setMessage("");
    setError("");

    const alreadyAdded =
      (room.products || []).some(
        (product) =>
          product.id === productId
      );

    if (alreadyAdded) {
      setMessage(
        "This product is already in the room."
      );
      return;
    }

    try {
      const response =
        await axios.post(
          `${API_URL}/rooms/add-product`,
          {
            room_id: room.room_id,
            product_id: productId,
          }
        );

      if (response?.data?.room) {
        setRoom(response.data.room);
        setResult(null);

        setMessage(
          "Product added to Decision Room."
        );
      } else {
        setError(
          getApiMessage(
            response,
            "Unable to add product."
          )
        );
      }
    } catch (err) {
      console.error(
        "Add product error:",
        err
      );

      setError(
        "Unable to add product to the room."
      );
    }
  };

  // ============================================================
  // AUTO-ADD PRODUCT FROM PRODUCT DETAILS
  // ============================================================

 // ============================================================
// AUTO-ADD PRODUCT FROM PRODUCT DETAILS
// ============================================================

useEffect(() => {
  if (!selectedProductId || !room?.room_id) {
    return;
  }

  const productId = Number(selectedProductId);

  const productKey =
    `${room.room_id}:${productId}`;

  // Already processed
  if (
    pendingProductKeyRef.current ===
    productKey
  ) {
    return;
  }

  const alreadyAdded =
    Array.isArray(room.products) &&
    room.products.some(
      (product) =>
        Number(product.id) === productId
    );

  // Product already exists
  if (alreadyAdded) {
    pendingProductKeyRef.current =
      productKey;
    return;
  }

  pendingProductKeyRef.current =
    productKey;

  addProductToRoom(productId);
}, [
  room?.room_id,
  room?.products,
  selectedProductId,
]);
  // ============================================================
  // ADD MEMBER
  // ============================================================

  const addMember = async () => {
    if (!room) {
      return;
    }

    const cleanMemberName =
      memberName.trim();

    if (!cleanMemberName) {
      setError(
        "Please enter a member name."
      );
      return;
    }

    setMemberLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await axios.post(
          `${API_URL}/rooms/add-member`,
          {
            room_id: room.room_id,
            member_name:
              cleanMemberName,
          }
        );

      if (response?.data?.room) {
        setRoom(response.data.room);
        setMemberName("");

        setMessage(
          response.data.message ||
            "Member added successfully."
        );
      } else {
        setError(
          getApiMessage(
            response,
            "Unable to add member."
          )
        );
      }
    } catch (err) {
      console.error(
        "Add member error:",
        err
      );

      setError(
        "Unable to add member."
      );
    } finally {
      setMemberLoading(false);
    }
  };

  // ============================================================
  // VOTE FOR PRODUCT
  // ============================================================

  const voteForProduct = async (
    productId
  ) => {
    if (!room) {
      return;
    }

    const cleanVotingMember =
      votingMember.trim();

    if (!cleanVotingMember) {
      setError(
        "Please enter your name before voting."
      );
      return;
    }

    const members =
      Array.isArray(room.members)
        ? room.members
        : [];

    const memberExists =
      members.some(
        (member) =>
          member?.name
            ?.toLowerCase() ===
          cleanVotingMember.toLowerCase()
      );

    if (!memberExists) {
      setError(
        "This name is not a member of the room. Join or add yourself first."
      );
      return;
    }

    const productExists =
      (room.products || []).some(
        (product) =>
          product.id === productId
      );

    if (!productExists) {
      setError(
        "This product is not part of the room."
      );
      return;
    }

    setVoteLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await axios.post(
          `${API_URL}/rooms/vote`,
          {
            room_id: room.room_id,
            member_name:
              cleanVotingMember,
            product_id: productId,
          }
        );

      if (response?.data?.room) {
        setRoom(response.data.room);

        setMessage(
          "Vote recorded successfully. 🗳️"
        );

        setResult(null);
      } else {
        setError(
          getApiMessage(
            response,
            "Unable to record vote."
          )
        );
      }
    } catch (err) {
      console.error(
        "Vote error:",
        err
      );

      setError(
        "Unable to record your vote."
      );
    } finally {
      setVoteLoading(false);
    }
  };

  // ============================================================
  // GET ROOM RESULT
  // ============================================================

  const getRoomResult = async () => {
    if (!room) {
      return;
    }

    setResultLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await axios.get(
          `${API_URL}/rooms/${room.room_id}/result`
        );

      if (
        response?.data?.status ===
          "winner" ||
        response?.data?.status === "tie"
      ) {
        setResult(response.data);
      } else {
        setResult(null);

        setError(
          getApiMessage(
            response,
            "No voting result is available yet."
          )
        );
      }
    } catch (err) {
      console.error(
        "Result error:",
        err
      );

      setError(
        "Unable to load voting result."
      );
    } finally {
      setResultLoading(false);
    }
  };

  // ============================================================
  // SHARE DECISION ROOM
  // ============================================================

  const getRoomLink = () => {
    if (!room?.room_id) {
      return "";
    }

    return `${window.location.origin}/decision-room/${room.room_id}`;
  };

  const shareDecisionRoom = async () => {
    if (!room) {
      return;
    }

    const roomLink =
      getRoomLink();

    if (!roomLink) {
      setError(
        "Unable to generate the room link."
      );
      return;
    }

    const shareText =
      `Join my ShopCircle Decision Room: ${room.room_name}`;

    try {
      if (
        navigator.share &&
        typeof navigator.share ===
          "function"
      ) {
        await navigator.share({
          title: `ShopCircle - ${room.room_name}`,
          text: shareText,
          url: roomLink,
        });
      } else if (
        navigator.clipboard &&
        typeof navigator.clipboard
          .writeText === "function"
      ) {
        await navigator.clipboard.writeText(
          roomLink
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        setError(
          "Copying the room link is not supported by this browser."
        );
      }
    } catch (err) {
      console.log(
        "Share cancelled or unavailable:",
        err
      );
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const formatPrice = (price) => {
    const numericPrice =
      Number(price);

    if (
      Number.isNaN(numericPrice)
    ) {
      return "Price unavailable";
    }

    return `₹${numericPrice.toLocaleString(
      "en-IN"
    )}`;
  };

  const getProductById = (
    productId
  ) => {
    return products.find(
      (product) =>
        product.id === productId
    );
  };

  const getVotePercentage = (
    votes
  ) => {
    const totalVotes =
      Number(result?.total_votes) || 0;

    const numericVotes =
      Number(votes) || 0;

    if (totalVotes <= 0) {
      return 0;
    }

    return Math.round(
      (numericVotes /
        totalVotes) *
        100
    );
  };

  const getMemberVoteProduct = (
    member
  ) => {
    if (!member?.vote) {
      return null;
    }

    return getProductById(
      member.vote
    );
  };

  const getVoteInsight = () => {
    if (!result || !Array.isArray(result.vote_summary)) {
      return "";
    }

    const ranked = result.vote_summary.filter(
      (item) => item?.product
    );

    if (ranked.length === 0) {
      return "";
    }

    if (result.status === "tie") {
      const names = Array.isArray(result.tied_products)
        ? result.tied_products
            .map((product) => product?.name)
            .filter(Boolean)
        : [];

      return names.length > 1
        ? `${names.join(" and ")} received the same number of votes. Your group needs one more deciding vote.`
        : "The group currently has a tie. Add another vote to break it.";
    }

    const winner = result.winner?.name || ranked[0]?.product?.name;
    const votes = Number(result.winner_votes) || 0;
    const total = Number(result.total_votes) || 0;

    if (total <= 0) {
      return `${winner} is currently leading the decision.`;
    }

    return `${winner} is the group's top choice with ${votes} of ${total} votes.`;
  };

  // ============================================================
  // SAFE ROOM DATA
  // ============================================================

  const roomProducts =
    Array.isArray(room?.products)
      ? room.products
      : [];

  const members =
    Array.isArray(room?.members)
      ? room.members
      : [];

  const votedMembers =
    members.filter(
      (member) =>
        member?.vote !== null &&
        member?.vote !== undefined
    ).length;

  const voteProgress =
    members.length > 0
      ? Math.round(
          (votedMembers /
            members.length) *
            100
        )
      : 0;

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading && !room) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            🛍️
          </div>

          <h2>
            Loading Decision Room...
          </h2>

          <p style={styles.mutedText}>
            Getting everything ready for
            your shopping decision.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // SHARED ROOM NOT FOUND
  // ============================================================

  if (
    roomId &&
    !room &&
    error
  ) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.joinCard}>
          <div style={styles.logoCircle}>
            🛍️
          </div>

          <h1 style={styles.mainTitle}>
            ShopCircle
          </h1>

          <h2>
            Decision Room Not Found
          </h2>

          <p style={styles.mutedText}>
            {error}
          </p>

          <a
            href="/decision-room"
            style={{
              textDecoration:
                "none",
            }}
          >
            <button
              style={
                styles.primaryButton
              }
            >
              Create New Room
            </button>
          </a>
        </div>
      </div>
    );
  }

  // ============================================================
  // JOIN SHARED ROOM
  // ============================================================

  if (
    roomId &&
    room &&
    !joined
  ) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.joinCard}>
          <div style={styles.logoCircle}>
            🛍️
          </div>

          <div style={styles.brandText}>
            ShopCircle
          </div>

          <div style={styles.joinIcon}>
            👥
          </div>

          <h1 style={styles.mainTitle}>
            Join Decision Room
          </h1>

          <p style={styles.mutedText}>
            You've been invited to
            collaborate on:
          </p>

          <div style={styles.roomPreview}>
            <h2>
              {room.room_name ||
                "Untitled Room"}
            </h2>

            <p>
              Created by{" "}
              <strong>
                {room.creator ||
                  "Unknown"}
              </strong>
            </p>

            <span
              style={
                styles.roomIdBadge
              }
            >
              {room.room_id}
            </span>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Enter your name"
            value={joinName}
            onChange={(e) =>
              setJoinName(
                e.target.value
              )
            }
            style={styles.input}
          />

          <button
            onClick={joinRoom}
            disabled={joinLoading}
            style={
              styles.primaryButton
            }
          >
            {joinLoading
              ? "Joining..."
              : "Join Decision Room →"}
          </button>

          <p style={styles.smallText}>
            Join your friends and help
            choose the best product.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // CREATE ROOM SCREEN
  // ============================================================

  if (!room) {
    return (
      <div style={styles.fullPage}>
        <div
          style={
            styles.createContainer
          }
        >
          <div
            style={
              styles.createHeader
            }
          >
            <div
              style={
                styles.logoCircle
              }
            >
              🛍️
            </div>

            <div
              style={
                styles.brandText
              }
            >
              ShopCircle
            </div>

            <h1
              style={
                styles.heroTitle
              }
            >
              Shop Together.
              <br />
              <span
                style={
                  styles.heroAccent
                }
              >
                Decide Smarter.
              </span>
            </h1>

            <p
              style={
                styles.heroDescription
              }
            >
              Create a collaborative
              shopping room, invite your
              friends, compare products,
              and vote together.
            </p>
          </div>

          {wishlistProducts.length >
            0 && (
            <div
              style={
                styles.wishlistBanner
              }
            >
              <div
                style={
                  styles.wishlistIcon
                }
              >
                ❤️
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 6px",
                  }}
                >
                  Your Wishlist is
                  Ready
                </h3>

                <p
                  style={
                    styles.smallText
                  }
                >
                  {
                    wishlistProducts.length
                  }{" "}
                  product
                  {wishlistProducts.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  will be added
                  automatically.
                </p>

                <div
                  style={
                    styles.wishlistMiniList
                  }
                >
                  {wishlistProducts.map(
                    (product) => (
                      <span
                        key={
                          product.id
                        }
                        style={
                          styles.wishlistChip
                        }
                      >
                        {
                          product.name
                        }
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div
              style={
                styles.successBox
              }
            >
              ✅ {message}
            </div>
          )}

          <div
            style={
              styles.createCard
            }
          >
            <div
              style={
                styles.sectionIcon
              }
            >
              ✨
            </div>

            <h2>
              Create Your Decision
              Room
            </h2>

            <p
              style={
                styles.mutedText
              }
            >
              Start a room and let
              your friends help you
              make the decision.
            </p>

            <label
              style={styles.label}
            >
              Room Name
            </label>

            <input
              type="text"
              placeholder="e.g. Laptop for College"
              value={roomName}
              onChange={(e) =>
                setRoomName(
                  e.target.value
                )
              }
              style={styles.input}
            />

            <label
              style={styles.label}
            >
              Your Name
            </label>

            <input
              type="text"
              placeholder="e.g. Tanusri"
              value={creatorName}
              onChange={(e) =>
                setCreatorName(
                  e.target.value
                )
              }
              style={styles.input}
            />

            <button
              onClick={createRoom}
              disabled={
                loading ||
                wishlistLoading
              }
              style={
                styles.primaryButton
              }
            >
              {loading ||
              wishlistLoading
                ? "Creating Room..."
                : wishlistProducts.length >
                    0
                  ? "Create Room with Wishlist ❤️"
                  : "Create Decision Room →"}
            </button>
          </div>

          <div
            style={
              styles.featureRow
            }
          >
            <div
              style={
                styles.featureItem
              }
            >
              <span>🔍</span>
              <strong>
                Compare
              </strong>
              <small>
                Products
              </small>
            </div>

            <div
              style={
                styles.featureItem
              }
            >
              <span>👥</span>
              <strong>
                Collaborate
              </strong>
              <small>
                With Friends
              </small>
            </div>

            <div
              style={
                styles.featureItem
              }
            >
              <span>🗳️</span>
              <strong>
                Vote
              </strong>
              <small>
                Together
              </small>
            </div>

            <div
              style={
                styles.featureItem
              }
            >
              <span>🏆</span>
              <strong>
                Decide
              </strong>
              <small>
                Smarter
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DECISION ROOM UI
  // ============================================================

  return (
    <div style={styles.app}>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div
            style={
              styles.headerBrand
            }
          >
            <div
              style={
                styles.headerLogo
              }
            >
              🛍️
            </div>

            <div>
              <div
                style={
                  styles.headerTitle
                }
              >
                ShopCircle
              </div>

              <div
                style={
                  styles.headerSubtitle
                }
              >
                Shop Together. Decide
                Smarter.
              </div>
            </div>
          </div>

          <div
            style={
              styles.headerStatus
            }
          >
            <span
              style={
                styles.liveDot
              }
            ></span>
            Decision Room
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* ====================================================
            ROOM HERO
        ==================================================== */}

        <section
          style={
            styles.roomHero
          }
        >
          <div style={{ flex: 1 }}>
            <div
              style={
                styles.eyebrow
              }
            >
              🏠 COLLABORATIVE
              SHOPPING
            </div>

            <h1
              style={
                styles.roomTitle
              }
            >
              {room.room_name ||
                "Decision Room"}
            </h1>

            <div
              style={
                styles.roomMeta
              }
            >
              <span>
                👤 Created by{" "}
                <strong>
                  {room.creator ||
                    "Unknown"}
                </strong>
              </span>

              <span
                style={
                  styles.dotSeparator
                }
              >
                •
              </span>

              <span>
                🆔{" "}
                {room.room_id}
              </span>
            </div>
          </div>

          <button
            onClick={
              shareDecisionRoom
            }
            style={
              styles.shareButton
            }
          >
            <span>
              {copied
                ? "✓"
                : "🔗"}
            </span>

            {copied
              ? "Link Copied"
              : "Share Room"}
          </button>
        </section>

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div
            style={
              styles.successBox
            }
          >
            ✅ {message}
          </div>
        )}

        {/* ====================================================
            ROOM STATS
        ==================================================== */}

        <section
          style={
            styles.statsGrid
          }
        >
          <div
            style={
              styles.statCard
            }
          >
            <div
              style={
                styles.statIcon
              }
            >
              👥
            </div>

            <div>
              <div
                style={
                  styles.statValue
                }
              >
                {members.length}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Members
              </div>
            </div>
          </div>

          <div
            style={
              styles.statCard
            }
          >
            <div
              style={
                styles.statIcon
              }
            >
              💻
            </div>

            <div>
              <div
                style={
                  styles.statValue
                }
              >
                {roomProducts.length}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Products
              </div>
            </div>
          </div>

          <div
            style={
              styles.statCard
            }
          >
            <div
              style={
                styles.statIcon
              }
            >
              🗳️
            </div>

            <div>
              <div
                style={
                  styles.statValue
                }
              >
                {votedMembers}
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Votes Cast
              </div>
            </div>
          </div>

          <div
            style={
              styles.statCard
            }
          >
            <div
              style={
                styles.statIcon
              }
            >
              📊
            </div>

            <div>
              <div
                style={
                  styles.statValue
                }
              >
                {voteProgress}%
              </div>

              <div
                style={
                  styles.statLabel
                }
              >
                Participation
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div
          style={
            styles.contentGrid
          }
        >
          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div
            style={
              styles.leftColumn
            }
          >
            {/* =================================================
                MEMBERS
            ================================================= */}

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.cardHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.cardTitle
                    }
                  >
                    👥 Members
                  </div>

                  <div
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Everyone helping
                    make the decision
                  </div>
                </div>

                <span
                  style={
                    styles.countBadge
                  }
                >
                  {members.length}
                </span>
              </div>

              <div
                style={
                  styles.memberGrid
                }
              >
                {members.map(
                  (
                    member,
                    index
                  ) => {
                    const votedProduct =
                      getMemberVoteProduct(
                        member
                      );

                    return (
                      <div
                        key={`${member.name}-${index}`}
                        style={
                          styles.memberCard
                        }
                      >
                        <div
                          style={
                            styles.avatar
                          }
                        >
                          {member.name
                            ?.charAt(
                              0
                            )
                            ?.toUpperCase() ||
                            "?"}
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <div
                            style={
                              styles.memberName
                            }
                          >
                            {member.name ||
                              "Member"}

                            {member.name ===
                              room.creator && (
                              <span
                                style={
                                  styles.creatorBadge
                                }
                              >
                                Creator
                              </span>
                            )}
                          </div>

                          {votedProduct ? (
                            <div
                              style={
                                styles.votedText
                              }
                            >
                              ✓ Voted
                              for{" "}
                              {
                                votedProduct.name
                              }
                            </div>
                          ) : (
                            <div
                              style={
                                styles.notVotedText
                              }
                            >
                              Waiting
                              for
                              vote
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize:
                              "18px",
                          }}
                        >
                          {member.vote
                            ? "✓"
                            : "○"}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div
                style={
                  styles.addMemberBox
                }
              >
                <input
                  type="text"
                  placeholder="Add a friend..."
                  value={
                    memberName
                  }
                  onChange={(e) =>
                    setMemberName(
                      e.target.value
                    )
                  }
                  style={
                    styles.smallInput
                  }
                />

                <button
                  onClick={
                    addMember
                  }
                  disabled={
                    memberLoading
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  {memberLoading
                    ? "Adding..."
                    : "+ Add Member"}
                </button>
              </div>
            </section>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.cardHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.cardTitle
                    }
                  >
                    💻 Products
                  </div>

                  <div
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Choose what your
                    group should
                    compare
                  </div>
                </div>

                {wishlistProducts.length >
                  0 && (
                  <button
                    onClick={() =>
                      addWishlistToRoom()
                    }
                    disabled={
                      wishlistLoading
                    }
                    style={
                      styles.wishlistButton
                    }
                  >
                    {wishlistLoading
                      ? "Adding..."
                      : "❤️ Add Wishlist"}
                  </button>
                )}
              </div>

              {productsLoading ? (
                <div
                  style={
                    styles.centerMessage
                  }
                >
                  Loading products...
                </div>
              ) : products.length ===
                0 ? (
                <div
                  style={
                    styles.centerMessage
                  }
                >
                  No products available.
                </div>
              ) : (
                <div
                  style={
                    styles.productGrid
                  }
                >
                  {products.map(
                    (product) => {
                      const alreadyAdded =
                        roomProducts.some(
                          (item) =>
                            item.id ===
                            product.id
                        );

                      const isWishlistProduct =
                        wishlistProducts.some(
                          (item) =>
                            item.id ===
                            product.id
                        );

                      return (
                        <div
                          key={
                            product.id
                          }
                          style={{
                            ...styles.productCard,
                            ...(isWishlistProduct
                              ? styles.wishlistProductCard
                              : {}),
                          }}
                        >
                          {isWishlistProduct && (
                            <span
                              style={
                                styles.wishlistTag
                              }
                            >
                              ❤️ Wishlist
                            </span>
                          )}

                          <div
                            style={
                              styles.productIcon
                            }
                          >
                            💻
                          </div>

                          <h3
                            style={
                              styles.productName
                            }
                          >
                            {
                              product.name
                            }
                          </h3>

                          <div
                            style={
                              styles.productBrand
                            }
                          >
                            {
                              product.brand
                            }
                          </div>

                          <div
                            style={
                              styles.productPrice
                            }
                          >
                            {formatPrice(
                              product.price
                            )}
                          </div>

                          <div
                            style={
                              styles.specList
                            }
                          >
                            <span>
                              ⚙️{" "}
                              {
                                product.processor
                              }
                            </span>

                            <span>
                              🧠{" "}
                              {
                                product.ram
                              }{" "}
                              GB RAM
                            </span>

                            <span>
                              💾{" "}
                              {
                                product.storage
                              }{" "}
                              GB SSD
                            </span>

                            <span>
                              🎮{" "}
                              {
                                product.gpu
                              }
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              addProductToRoom(
                                product.id
                              )
                            }
                            disabled={
                              alreadyAdded
                            }
                            style={
                              alreadyAdded
                                ? styles.addedButton
                                : styles.addProductButton
                            }
                          >
                            {alreadyAdded
                              ? "✓ Added to Room"
                              : "+ Add to Room"}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                SELECTED PRODUCTS
            ================================================= */}

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.cardHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.cardTitle
                    }
                  >
                    ⭐ Selected
                    Products
                  </div>

                  <div
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Products your group
                    will vote on
                  </div>
                </div>

                <span
                  style={
                    styles.countBadge
                  }
                >
                  {roomProducts.length}
                </span>
              </div>

              {roomProducts.length ===
              0 ? (
                <div
                  style={
                    styles.emptyState
                  }
                >
                  <div
                    style={
                      styles.emptyIcon
                    }
                  >
                    🛒
                  </div>

                  <strong>
                    No products
                    selected yet
                  </strong>

                  <p>
                    Add products above
                    to start your group
                    decision.
                  </p>
                </div>
              ) : (
                <div
                  style={
                    styles.selectedList
                  }
                >
                  {roomProducts.map(
                    (
                      product,
                      index
                    ) => (
                      <div
                        key={
                          product.id
                        }
                        style={
                          styles.selectedProduct
                        }
                      >
                        <div
                          style={
                            styles.selectedNumber
                          }
                        >
                          {index + 1}
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <div
                            style={
                              styles.selectedMeta
                            }
                          >
                            {
                              product.brand
                            }{" "}
                            •{" "}
                            {formatPrice(
                              product.price
                            )}
                          </div>

                          {(() => {
                            const insight =
                              getProductInsight(product);

                            return (
                              <div
                                className="product-intelligence"
                                style={
                                  styles.productIntelligence
                                }
                              >
                                <div
                                  style={
                                    styles.intelligenceHeader
                                  }
                                >
                                  <span>
                                    🧠 Product Intelligence
                                  </span>

                                  <strong
                                    style={
                                      styles.intelligenceHeaderScore
                                    }
                                  >
                                    {insight.score}%
                                  </strong>
                                </div>

                                <div
                                  style={
                                    styles.intelligenceBar
                                  }
                                >
                                  <div
                                    style={{
                                      ...styles.intelligenceBarFill,
                                      width: `${insight.score}%`,
                                    }}
                                  />
                                </div>

                                <div
                                  style={
                                    styles.intelligenceStats
                                  }
                                >
                                  <span
                                    style={
                                      styles.intelligenceStat
                                    }
                                  >
                                    💻 Coding{" "}
                                    {product.coding}/10
                                  </span>

                                  <span
                                    style={
                                      styles.intelligenceStat
                                    }
                                  >
                                    🎮 Gaming{" "}
                                    {product.gaming}/10
                                  </span>

                                  <span
                                    style={
                                      styles.intelligenceStat
                                    }
                                  >
                                    🔋 Battery{" "}
                                    {product.battery}/10
                                  </span>
                                </div>

                                <div
                                  style={
                                    styles.intelligenceStrength
                                  }
                                >
                                  <strong>
                                    Strongest:
                                  </strong>{" "}
                                  {insight.strength}
                                </div>

                                <p
                                  style={
                                    styles.intelligenceExplanation
                                  }
                                >
                                  💡{" "}
                                  {insight.explanation}
                                </p>
                              </div>
                            );
                          })()}
                        </div>

                        <span
                          style={
                            styles.selectedCheck
                          }
                        >
                          ✓
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <aside
            style={
              styles.rightColumn
            }
          >
            {/* =================================================
                VOTING
            ================================================= */}

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.cardHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.cardTitle
                    }
                  >
                    🗳️ Cast Your
                    Vote
                  </div>

                  <div
                    style={
                      styles.cardSubtitle
                    }
                  >
                    Pick the product
                    you prefer
                  </div>
                </div>
              </div>

              <label
                style={
                  styles.label
                }
              >
                Voting as
              </label>

              <input
                type="text"
                placeholder="Enter your member name"
                value={
                  votingMember
                }
                onChange={(e) =>
                  setVotingMember(
                    e.target.value
                  )
                }
                style={
                  styles.input
                }
              />

              {roomProducts.length ===
              0 ? (
                <div
                  style={
                    styles.voteEmpty
                  }
                >
                  Add products before
                  voting.
                </div>
              ) : (
                <div
                  style={
                    styles.voteList
                  }
                >
                  {roomProducts.map(
                    (product) => {
                      const currentMember =
                        members.find(
                          (member) =>
                            member?.name
                              ?.toLowerCase() ===
                            votingMember
                              .trim()
                              .toLowerCase()
                        );

                      const selectedVote =
                        currentMember?.vote;

                      const isSelected =
                        selectedVote ===
                        product.id;

                      return (
                        <button
                          key={
                            product.id
                          }
                          onClick={() =>
                            voteForProduct(
                              product.id
                            )
                          }
                          disabled={
                            voteLoading
                          }
                          style={{
                            ...styles.voteButton,
                            ...(isSelected
                              ? styles.selectedVoteButton
                              : {}),
                          }}
                        >
                          <div
                            style={
                              styles.voteProductIcon
                            }
                          >
                            💻
                          </div>

                          <div
                            style={{
                              flex: 1,
                              textAlign:
                                "left",
                            }}
                          >
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <span
                              style={
                                styles.votePrice
                              }
                            >
                              {formatPrice(
                                product.price
                              )}
                            </span>
                          </div>

                          <span
                            style={
                              styles.voteArrow
                            }
                          >
                            {isSelected
                              ? "✓ Voted"
                              : "Vote →"}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </section>

            {/* =================================================
                PARTICIPATION
            ================================================= */}

            <section
              style={
                styles.progressCard
              }
            >
              <div
                style={
                  styles.progressHeader
                }
              >
                <strong>
                  📊 Voting Progress
                </strong>

                <span>
                  {votedMembers}/
                  {members.length}
                </span>
              </div>

              <div
                style={
                  styles.progressTrack
                }
              >
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${voteProgress}%`,
                  }}
                />
              </div>

              <p
                style={
                  styles.progressText
                }
              >
                {members.length ===
                0
                  ? "No members yet."
                  : voteProgress ===
                      100
                    ? "Everyone has voted! 🎉"
                    : `${
                        members.length -
                        votedMembers
                      } member${
                        members.length -
                          votedMembers !==
                        1
                          ? "s"
                          : ""
                      } still need to vote.`}
              </p>
            </section>

            {/* =================================================
                RESULT
            ================================================= */}

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.cardHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.cardTitle
                    }
                  >
                    🏆 Decision
                  </div>

                  <div
                    style={
                      styles.cardSubtitle
                    }
                  >
                    See what your group
                    chose
                  </div>
                </div>
              </div>

              <div style={styles.resultActions}>
                <button
                  onClick={
                    getRoomResult
                  }
                  disabled={
                    resultLoading ||
                    members.length ===
                      0
                  }
                  style={
                    styles.resultButton
                  }
                >
                  {resultLoading
                    ? "Calculating..."
                    : result
                      ? "🔄 Refresh Result"
                      : "🏆 Show Result"}
                </button>

                {result && (
                  <div style={styles.resultHint}>
                    {result.status === "winner"
                      ? "The group has a clear winner."
                      : "The room currently has no single winner."}
                  </div>
                )}
              </div>

              {result && (
                <div
                  style={
                    styles.resultContainer
                  }
                >
                  {/* WINNER */}

                  {result.status ===
                    "winner" &&
                    result.winner && (
                      <div
                        style={
                          styles.winnerCard
                        }
                      >
                        <div
                          style={
                            styles.trophy
                          }
                        >
                          🏆
                        </div>

                        <div
                          style={
                            styles.winnerLabel
                          }
                        >
                          GROUP WINNER
                        </div>

                        <h2
                          style={
                            styles.winnerName
                          }
                        >
                          {
                            result
                              .winner
                              .name
                          }
                        </h2>

                        <div
                          style={
                            styles.winnerVotes
                          }
                        >
                          {
                            result.winner_votes
                          }{" "}
                          vote
                          {result.winner_votes !==
                          1
                            ? "s"
                            : ""}
                        </div>

                        <div
                          style={
                            styles.winnerPercent
                          }
                        >
                          {getVotePercentage(
                            result.winner_votes
                          )}
                          % of votes
                        </div>
                      </div>
                    )}

                  {/* TIE */}

                  {result.status ===
                    "tie" && (
                    <div
                      style={
                        styles.tieCard
                      }
                    >
                      <div
                        style={
                          styles.trophy
                        }
                      >
                        ⚖️
                      </div>

                      <div
                        style={
                          styles.winnerLabel
                        }
                      >
                        NO CLEAR
                        WINNER
                      </div>

                      <h2>
                        It's a Tie!
                      </h2>

                      <p>
                        Multiple products
                        received{" "}
                        <strong>
                          {
                            result.winner_votes
                          }
                        </strong>{" "}
                        vote
                        {result.winner_votes !==
                        1
                          ? "s"
                          : ""}.
                      </p>

                      <div
                        style={
                          styles.tieProducts
                        }
                      >
                        {Array.isArray(
                          result.tied_products
                        ) &&
                          result.tied_products.map(
                            (
                              product
                            ) => (
                              <span
                                key={
                                  product.id
                                }
                                style={
                                  styles.tieChip
                                }
                              >
                                {
                                  product.name
                                }
                              </span>
                            )
                          )}
                      </div>
                    </div>
                  )}

                  {/* VOTE SUMMARY */}

                  <div
                    style={
                      styles.summarySection
                    }
                  >
                    <div style={styles.summaryHeadingRow}>
                      <div>
                        <h3 style={{ margin: 0 }}>
                          Vote Breakdown
                        </h3>
                        <p style={styles.summarySubtext}>
                          See how strongly each product matched your group's decision.
                        </p>
                      </div>
                      <span style={styles.totalVotesBadge}>
                        {result.total_votes || 0} total
                      </span>
                    </div>

                    {Array.isArray(
                      result.vote_summary
                    ) &&
                      result.vote_summary.map(
                        (item, index) => {
                          if (
                            !item?.product
                          ) {
                            return null;
                          }

                          const percentage =
                            getVotePercentage(
                              item.votes
                            );

                          return (
                            <div
                              key={
                                item
                                  .product
                                  .id
                              }
                              style={
                                styles.voteSummary
                              }
                            >
                              <div
                                style={
                                  styles.summaryTop
                                }
                              >
                                <span style={styles.summaryProductName}>
                                  <span style={styles.rankBadge}>
                                    {index + 1}
                                  </span>
                                  {
                                    item
                                      .product
                                      .name
                                  }
                                </span>

                                <strong>
                                  {
                                    item.votes
                                  }{" "}
                                  vote
                                  {item.votes !==
                                  1
                                    ? "s"
                                    : ""}
                                </strong>
                              </div>

                              <div
                                style={
                                  styles.summaryTrack
                                }
                              >
                                <div
                                  style={{
                                    ...styles.summaryFill,
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <div style={styles.summaryBottom}>
                                <span>
                                  {percentage}% of votes
                                </span>
                                {index === 0 && item.votes > 0 && (
                                  <span style={styles.leadingBadge}>
                                    {result.status === "tie"
                                      ? "Tied lead"
                                      : "Leading"}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                  </div>

                  <div style={styles.insightCard}>
                    <div style={styles.insightIcon}>💡</div>
                    <div>
                      <div style={styles.insightTitle}>
                        Why this result?
                      </div>
                      <div style={styles.insightText}>
                        {getVoteInsight()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>

        {/* ====================================================
            SHARE FOOTER
        ==================================================== */}

        <section
          style={
            styles.shareFooter
          }
        >
          <div>
            <div
              style={{
                fontSize: "22px",
                marginBottom:
                  "5px",
              }}
            >
              🔗
            </div>

            <strong>
              Want your friends to
              join?
            </strong>

            <p
              style={
                styles.smallText
              }
            >
              Share this room and
              decide together.
            </p>
          </div>

          <button
            onClick={
              shareDecisionRoom
            }
            style={
              styles.primaryButtonSmall
            }
          >
            {copied
              ? "✓ Copied!"
              : "Share Decision Room"}
          </button>
        </section>
      </main>
    </div>
  );
}

// ============================================================
// KEEP YOUR EXISTING STYLES OBJECT HERE
// ============================================================

const styles = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 48%, #f5f7ff 100%)",
    color: "#111827",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  fullPage: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 52%, #f6f7ff 100%)",
    padding: "34px 20px 56px",
    boxSizing: "border-box",
  },
  createContainer: {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
  },
  createHeader: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logoCircle: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    margin: "0 auto 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    background: "linear-gradient(135deg, #111827, #4f46e5)",
    boxShadow: "0 12px 30px rgba(79,70,229,.18)",
  },
  brandText: {
    fontSize: "15px",
    fontWeight: 800,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: "#4f46e5",
    marginBottom: "14px",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(38px, 6vw, 64px)",
    lineHeight: 1.04,
    letterSpacing: "-0.045em",
    fontWeight: 850,
    color: "#111827",
  },
  heroAccent: {
    color: "#4f46e5",
  },
  heroDescription: {
    maxWidth: "680px",
    margin: "16px auto 0",
    fontSize: "17px",
    lineHeight: 1.65,
    color: "#64748b",
  },
  errorBox: {
    maxWidth: "760px",
    margin: "0 auto 18px",
    padding: "13px 16px",
    borderRadius: "14px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#be123c",
    fontWeight: 700,
  },
  successBox: {
    maxWidth: "760px",
    margin: "0 auto 18px",
    padding: "13px 16px",
    borderRadius: "14px",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#047857",
    fontWeight: 700,
  },
  wishlistBanner: {
    maxWidth: "760px",
    margin: "0 auto 18px",
    padding: "16px 18px",
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    borderRadius: "18px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    boxShadow: "0 10px 28px rgba(234,88,12,.07)",
    boxSizing: "border-box",
  },
  wishlistIcon: {
    width: "42px",
    height: "42px",
    flex: "0 0 42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    fontSize: "21px",
  },
  wishlistMiniList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "10px",
  },
  wishlistChip: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: "12px",
    fontWeight: 700,
  },
  createCard: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "34px",
    borderRadius: "26px",
    background: "rgba(255,255,255,.96)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 70px rgba(15,23,42,.09)",
    boxSizing: "border-box",
  },
  sectionIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 12px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    fontSize: "23px",
  },
  mainTitle: {
    margin: "0 0 10px",
    textAlign: "center",
    fontSize: "32px",
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
  },
  mutedText: {
    color: "#64748b",
    lineHeight: 1.6,
    textAlign: "center",
    margin: "0 0 22px",
  },
  label: {
    display: "block",
    margin: "18px 0 8px",
    fontSize: "13px",
    fontWeight: 800,
    color: "#334155",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "13px",
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#111827",
    fontSize: "15px",
    outline: "none",
    boxShadow: "0 1px 2px rgba(15,23,42,.03)",
  },
  smallInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: "11px",
    border: "1px solid #dbe2ea",
    background: "#ffffff",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
  },
  primaryButton: {
    width: "100%",
    marginTop: "18px",
    padding: "14px 18px",
    border: "0",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(79,70,229,.22)",
  },
  primaryButtonSmall: {
    padding: "12px 18px",
    border: "0",
    borderRadius: "12px",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    padding: "11px 15px",
    border: "1px solid #dbe2ea",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 750,
    cursor: "pointer",
  },
  joinCard: {
    width: "100%",
    maxWidth: "540px",
    margin: "8vh auto 0",
    padding: "34px",
    borderRadius: "26px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 24px 70px rgba(15,23,42,.10)",
    boxSizing: "border-box",
    textAlign: "center",
  },
  joinIcon: {
    fontSize: "38px",
    margin: "10px 0 12px",
  },
  roomPreview: {
    padding: "18px",
    margin: "18px 0",
    borderRadius: "17px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  roomIdBadge: {
    display: "inline-block",
    marginTop: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: ".05em",
  },
  smallText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  featureRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "12px",
    maxWidth: "760px",
    margin: "18px auto 0",
  },
  featureItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    minHeight: "78px",
    padding: "12px 8px",
    boxSizing: "border-box",
    borderRadius: "15px",
    background: "rgba(255,255,255,.75)",
    border: "1px solid #e5e7eb",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 750,
    textAlign: "center",
  },
  fullPageTitle: {},
  // Main room layout
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 50%, #f7f8ff 100%)",
    paddingBottom: "56px",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(255,255,255,.92)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #e5e7eb",
  },
  headerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    boxSizing: "border-box",
  },
  headerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },
  headerLogo: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    fontSize: "21px",
    flex: "0 0 42px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 850,
    color: "#111827",
  },
  headerSubtitle: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },
  headerStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#047857",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#10b981",
  },
  contentGrid: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "28px 20px 0",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.55fr) minmax(320px, .8fr)",
    gap: "22px",
    boxSizing: "border-box",
  },
  leftColumn: {
    minWidth: 0,
  },
  rightColumn: {
    minWidth: 0,
  },
  roomHero: {
    padding: "26px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, #111827 0%, #312e81 100%)",
    color: "#ffffff",
    boxShadow: "0 20px 45px rgba(15,23,42,.16)",
    marginBottom: "18px",
  },
  eyebrow: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.12)",
    color: "#e0e7ff",
    fontSize: "11px",
    fontWeight: 850,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },
  roomTitle: {
    margin: "13px 0 8px",
    fontSize: "clamp(28px, 4vw, 40px)",
    lineHeight: 1.08,
    letterSpacing: "-0.035em",
  },
  roomMeta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    color: "#cbd5e1",
    fontSize: "13px",
  },
  dotSeparator: {
    opacity: .55,
  },
  creatorBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 9px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.1)",
    color: "#f8fafc",
    fontWeight: 700,
  },
  card: {
    padding: "22px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15,23,42,.055)",
    marginBottom: "18px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "17px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#111827",
  },
  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: 1.5,
  },
  countBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  productCard: {
    padding: "16px",
    borderRadius: "17px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    boxSizing: "border-box",
  },
  productIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    fontSize: "21px",
    marginBottom: "10px",
  },
  productName: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.35,
  },
  productBrand: {
    marginTop: "3px",
    fontSize: "12px",
    color: "#64748b",
  },
  productPrice: {
    marginTop: "10px",
    fontSize: "16px",
    fontWeight: 850,
    color: "#111827",
  },
  specList: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px 10px",
    margin: "12px 0",
    fontSize: "11px",
    color: "#64748b",
  },
  addProductButton: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  addedButton: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: 800,
  },
  selectedList: {
    display: "grid",
    gap: "10px",
  },
  selectedProduct: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "13px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  selectedNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
    flex: "0 0 28px",
  },
  selectedMeta: {
    flex: 1,
    minWidth: 0,
  },
  productIntelligence: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "11px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },
  intelligenceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "7px",
    fontSize: "11px",
    color: "#334155",
  },
  intelligenceHeaderScore: {
    fontSize: "14px",
    color: "#111827",
  },
  intelligenceBar: {
    width: "100%",
    height: "6px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  intelligenceBarFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#2563eb",
    transition: "width 0.4s ease",
  },
  intelligenceStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "8px",
  },
  intelligenceStat: {
    padding: "4px 6px",
    borderRadius: "7px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "10px",
    color: "#475569",
  },
  intelligenceStrength: {
    marginTop: "8px",
    fontSize: "11px",
    color: "#334155",
  },
  intelligenceExplanation: {
    margin: "5px 0 0",
    fontSize: "10px",
    lineHeight: 1.45,
    color: "#64748b",
  },
  selectedCheck: {
    color: "#16a34a",
    fontWeight: 900,
  },
  addMemberBox: {
    display: "flex",
    gap: "9px",
    alignItems: "center",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "14px",
  },
  memberCard: {
    padding: "12px",
    borderRadius: "13px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  memberName: {
    fontSize: "13px",
    fontWeight: 800,
    color: "#334155",
  },
  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e0e7ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: 850,
    marginRight: "9px",
  },
  statCard: {
    padding: "14px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  statIcon: {
    fontSize: "18px",
    marginBottom: "5px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: 900,
    color: "#111827",
  },
  statLabel: {
    marginTop: "2px",
    fontSize: "11px",
    color: "#64748b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "10px",
  },
  voteList: {
    display: "grid",
    gap: "10px",
  },
  voteButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    textAlign: "left",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
    cursor: "pointer",
  },
  voteProductIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f1f5f9",
    fontSize: "19px",
    flex: "0 0 40px",
  },
  votePrice: {
    marginTop: "2px",
    color: "#64748b",
    fontSize: "12px",
  },
  voteArrow: {
    marginLeft: "auto",
    color: "#4f46e5",
    fontWeight: 900,
  },
  selectedVoteButton: {
    border: "1px solid #818cf8",
    background: "#eef2ff",
  },
  voteEmpty: {
    padding: "18px",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
    fontSize: "13px",
  },
  votedText: {
    marginTop: "7px",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: 750,
  },
  notVotedText: {
    marginTop: "7px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  progressCard: {
    padding: "17px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginTop: "12px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "12px",
    fontWeight: 750,
    color: "#475569",
  },
  progressTrack: {
    height: "8px",
    marginTop: "9px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "#e2e8f0",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #4f46e5, #818cf8)",
    transition: "width .25s ease",
  },
  progressText: {
    marginTop: "7px",
    fontSize: "11px",
    color: "#64748b",
  },
  resultActions: {
    display: "grid",
    gap: "8px",
  },
  resultButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "1px solid #c7d2fe",
    borderRadius: "11px",
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: 850,
    cursor: "pointer",
  },
  resultHint: {
    padding: "8px 10px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "11px",
    textAlign: "center",
  },
  resultContainer: {
    display: "grid",
    gap: "12px",
  },
  winnerCard: {
    padding: "22px",
    borderRadius: "19px",
    textAlign: "center",
    background: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
    border: "1px solid #bbf7d0",
  },
  trophy: {
    fontSize: "40px",
    marginBottom: "7px",
  },
  winnerLabel: {
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".1em",
    color: "#15803d",
    textTransform: "uppercase",
  },
  winnerName: {
    margin: "8px 0 4px",
    fontSize: "23px",
    fontWeight: 900,
    color: "#14532d",
  },
  winnerVotes: {
    color: "#166534",
    fontSize: "13px",
  },
  winnerPercent: {
    marginTop: "8px",
    fontSize: "28px",
    fontWeight: 900,
    color: "#15803d",
  },
  tieCard: {
    padding: "22px",
    borderRadius: "19px",
    textAlign: "center",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
  },
  tieProducts: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "7px",
    marginTop: "12px",
  },
  tieChip: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: "12px",
    fontWeight: 750,
  },
  summarySection: {
    padding: "16px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  summaryHeadingRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  summarySubtext: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.45,
  },
  totalVotesBadge: {
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  voteSummary: {
    marginTop: "13px",
  },
  summaryProductName: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    minWidth: 0,
  },
  rankBadge: {
    width: "20px",
    height: "20px",
    borderRadius: "7px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#4338ca",
    fontSize: "10px",
    fontWeight: 900,
    flex: "0 0 20px",
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px",
    color: "#334155",
  },
  summaryTrack: {
    height: "7px",
    marginTop: "7px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "#e2e8f0",
  },
  summaryFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#4f46e5",
  },
  summaryBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "4px",
    fontSize: "10px",
    color: "#64748b",
  },
  summaryPercentage: {
    display: "block",
    marginTop: "4px",
    textAlign: "right",
    fontSize: "10px",
    color: "#64748b",
  },
  leadingBadge: {
    padding: "3px 6px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#047857",
    fontWeight: 800,
  },
  insightCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "11px",
    padding: "14px",
    borderRadius: "15px",
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
  },
  insightIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    fontSize: "17px",
    flex: "0 0 34px",
  },
  insightTitle: {
    fontSize: "12px",
    fontWeight: 900,
    color: "#3730a3",
    marginBottom: "3px",
  },
  insightText: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: "#475569",
  },
  shareFooter: {
    maxWidth: "1140px",
    margin: "0 auto",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    borderRadius: "20px",
    background: "#111827",
    color: "#ffffff",
    boxSizing: "border-box",
  },
  shareButton: {
    padding: "11px 15px",
    border: "0",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
  },
  wishlistButton: {
    padding: "10px 12px",
    border: "1px solid #fed7aa",
    borderRadius: "10px",
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  wishlistProductCard: {
    padding: "12px",
    borderRadius: "13px",
    background: "#fffaf5",
    border: "1px solid #fed7aa",
  },
  wishlistTag: {
    display: "inline-block",
    marginBottom: "6px",
    padding: "4px 7px",
    borderRadius: "999px",
    background: "#ffedd5",
    color: "#9a3412",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  centerMessage: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },
  loadingCard: {
    padding: "28px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 16px 40px rgba(15,23,42,.06)",
  },
  loadingIcon: {
    fontSize: "34px",
    marginBottom: "8px",
  },
  emptyState: {
    padding: "24px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
    color: "#64748b",
  },
  emptyIcon: {
    fontSize: "30px",
    marginBottom: "7px",
  },
};
export default DecisionRoom;
