export const RBACMap = [
  {
    name: "admin",
    allowed: [
      {
        route: "/business",
        methods: ["GET", "POST", "PUT"],
      },
    ],
  },
];
