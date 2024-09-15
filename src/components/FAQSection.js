import React, { useState, useEffect } from "react";
import FAQCard from "./FAQCard";
import "../componentCss/FAQSection.css";

const FAQSection = () => {
  const [faqItems, setFaqItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({
    image: "",
    title: "",
    description: "",
  });

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch("https://fruit-ai-backend-ljio.onrender.com/faqs");
        const data = await response.json();
        setFaqItems(data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      }
    };

    fetchFaqs();
  }, [newItem]);

  // Handle delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `https://fruit-ai-backend-ljio.onrender.com/faqs/${deleteId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setFaqItems(faqItems.filter((item) => item.id !== deleteId));
        setShowDialog(false);
      } else {
        console.error("Error deleting FAQ:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowDialog(false);
  };

  // Handle edit
  const handleEditClick = (item) => {
    setEditItem(item);
    setShowEditForm(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditItem({ ...editItem, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditItem({ ...editItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `https://fruit-ai-backend-ljio.onrender.com/faqs/${editItem.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editItem.title,
            description: editItem.description,
            image: editItem.image,
            altText: "FAQ",
          }),
        }
      );

      if (response.ok) {
        const updatedFaq = await response.json();
        setFaqItems(
          faqItems.map((item) =>
            item.id === editItem.id ? updatedFaq : item
          )
        );
        setShowEditForm(false);
      } else {
        console.error("Failed to update FAQ");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  // Handle new FAQ creation
  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewSubmit = async (e) => {
    e.preventDefault();

    const optimisticFaq = {
      id: Date.now().toString(), // Temporary ID, replace with real ID after successful creation
      ...newItem,
    };
    setFaqItems((prevFaqItems) => [...prevFaqItems, optimisticFaq]);

    try {
      const response = await fetch("https://fruit-ai-backend-ljio.onrender.com/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newItem.title,
          description: newItem.description,
          image: newItem.image,
          altText: "FAQ",
        }),
      });

      if (response.ok) {
        const newFaq = await response.json();
        setFaqItems((prevFaqItems) =>
          prevFaqItems.map((item) =>
            item.id === optimisticFaq.id ? newFaq : item
          )
        );
        setShowAddForm(false);
        setNewItem({ image: "", title: "", description: "" });
      } else {
        console.error("Failed to create FAQ");
        setFaqItems((prevFaqItems) =>
          prevFaqItems.filter((item) => item.id !== optimisticFaq.id)
        );
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      setFaqItems((prevFaqItems) =>
        prevFaqItems.filter((item) => item.id !== optimisticFaq.id)
      );
    }
  };

  return (
    <div className="faq-section">
      <h2 className="faq-section-title">FAQ Section</h2>

      <button className="add-faq-btn" onClick={() => setShowAddForm(true)}>
        Add New FAQ
      </button>

      <div className="faq-list">
        {faqItems.map((faq) => (
          <FAQCard
            key={faq.id}
            id={faq.id}
            image={faq.image || newItem.image}
            title={faq.title || newItem.title}
            description={faq.description || newItem.description}
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
          />
        ))}
      </div>

      {showAddForm && (
        <div className="edit-form">
          <h3>Add New FAQ Item</h3>
          <form onSubmit={handleNewSubmit}>
            <label>
              Image:
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageChange}
              />
              {newItem.image && (
                <img
                  src={newItem.image}
                  alt="Preview"
                  className="edit-form-image-preview"
                />
              )}
            </label>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={newItem.title}
                onChange={handleNewChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleNewChange}
                required
              />
            </label>
            <button type="submit" className="confirm-btn">
              Add FAQ
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {showDialog && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this item?</p>
          <button className="confirm-btn" onClick={handleConfirmDelete}>
            Yes, Delete
          </button>
          <button className="cancel-btn" onClick={handleCancelDelete}>
            Cancel
          </button>
        </div>
      )}

      {showEditForm && (
        <div className="edit-form">
          <h3>Edit FAQ Item</h3>
          <form onSubmit={handleEditSubmit}>
            <label>
              Image:
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {editItem.image && (
                <img
                  src={editItem.image}
                  alt="Preview"
                  className="edit-form-image-preview"
                />
              )}
            </label>
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={editItem.title}
                onChange={handleEditChange}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                name="description"
                value={editItem.description}
                onChange={handleEditChange}
                required
              />
            </label>
            <button type="submit" className="confirm-btn">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FAQSection;