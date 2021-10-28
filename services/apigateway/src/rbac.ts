export const RBACMap = [
  {
    name: "admin",
    allowed: [
      {
        route: "/protected",
        methods: ["GET", "POST", "PUT"],
      },
    ],
  },
];
